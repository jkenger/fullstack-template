# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint codebase
npm run lint

# Preview production build
npm run preview

# Deploy to Cloudflare
npm run deploy

# Generate Cloudflare types
npm run cf-typegen

# Database development tools
npx drizzle-kit studio          # Open Drizzle Studio (auto-detects local/remote)
npx drizzle-kit generate        # Generate new migrations
npx drizzle-kit migrate         # Apply migrations to remote D1
npx drizzle-kit push            # Push schema changes to remote D1
```

## Architecture Overview

This is a full-stack TypeScript application using:

### Frontend Stack

- **React 19** with TanStack Router for file-based routing
- **TanStack Query** for server state management
- **Vite** for bundling and development
- **Hono RPC Client** for type-safe API calls

### Backend Stack

- **Hono** web framework running on Cloudflare Workers
- **Zod** for request/response validation with OpenAPI metadata
- **RPC Pattern** with full type inference from backend to frontend
- **OpenAPI & Swagger** for comprehensive API documentation
- **Drizzle ORM** with Cloudflare D1 integration through dependency injection
- **Cloudflare D1** SQLite database with automatic local/remote switching

### API Documentation

The application provides comprehensive API documentation through multiple interfaces:

- **Interactive Documentation**: Available at `/docs` in the React app, powered by `swagger-ui-react`
- **OpenAPI Specification**: Accessible at `/api/v1/openapi.json` for programmatic consumption
- **ReDoc Interface**: Alternative documentation view at `/api/v1/redoc`

The documentation is automatically generated from Zod schemas with OpenAPI metadata, ensuring it stays in sync with the actual API implementation.

### Key Architecture Patterns

#### Hono RPC Integration

The backend exports `AppType` from `worker/routes/index.ts` which provides complete type safety to the
frontend:

```typescript
// Backend route definition automatically infers types
const app = new Hono()
  .basePath('/api')
  .route('/users', createUserRoutes(container))

export type AppType = ReturnType<typeof createRpcApp>

// Frontend gets full type safety
const client = hc<AppType>('/')
const response = await client.api.users.me.$get()
```

#### Dual API Architecture

**RPC Routes (`/api/*`)** - Type-safe for frontend integration
**OpenAPI Routes (`/api/v1/*`)** - Documented for external consumers

**API Documentation:**
- **Interactive Docs**: `http://localhost:5173/api/v1/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:5173/api/v1/redoc` (ReDoc)
- **OpenAPI Spec**: `http://localhost:5173/api/v1/openapi.json`

#### Global API Response Format

All API endpoints use standardized response wrappers from `worker/lib/response.ts`:

- `ApiResponse<T>` for single entities
- `PaginatedResponse<T>` for paginated lists
- Helper functions: `createSuccessResponse()`, `createErrorResponse()`, `createPaginatedResponse()`

#### Service Layer Architecture

Modern service layer with dependency injection and inheritance-based shared functionality:

- **Dependency Injection Container** manages service lifecycle and dependencies
- `BaseService<T>` provides generic pagination, sorting, and text search
- Entity services (e.g., `TodoService`) extend base and focus on domain logic
- Services are registered in container with singleton pattern for performance
- Route factories accept container for clean dependency resolution

#### Frontend Data Layer

- Custom hooks in `src/hooks/` encapsulate API calls and state management
- Query hooks handle server state with automatic caching and revalidation
- Mutation hooks provide optimistic updates and error handling
- Type-safe query parameter handling with string conversion for URLs

#### Schema-First Development with OpenAPI

Zod schemas in `worker/schemas/` define data contracts with OpenAPI metadata for automatic API documentation generation. See `/api/v1/docs` for complete schema documentation.

## Authentication & Authorization

The application uses **Better Auth** for comprehensive authentication with role-based access control:

### Better Auth Integration

- **Email/Password Authentication**: Built-in user registration and login
- **OAuth Providers**: GitHub and Google sign-in (configurable)
- **Session Management**: Secure cookie-based sessions with automatic refresh
- **Database Integration**: Drizzle adapter for seamless D1 SQLite storage

### Authentication Architecture

**Backend Authentication Flow:**
1. **Better Auth Routes** (`/api/auth/*`): Handle sign-up, sign-in, session management
2. **Auth Middleware** (`worker/middleware/auth.ts`): Validates sessions and sets user context
3. **Container Integration**: User context injected into services via dependency injection
4. **Role-Based Guards**: `requireRole()` and `requireAnyRole()` middleware for protected routes

**Frontend Authentication Flow:**
1. **Auth Client** (`src/lib/auth-client.ts`): Better Auth React client for session management
2. **Auth Hooks** (`src/hooks/useAuth.ts`): React hooks for authentication state and mutations
3. **Single Source of Truth**: Better Auth session data is primary, API calls for fresh data only when needed
4. **Protected Routes**: Route-level authentication guards with automatic redirects

### Key Authentication Features

**User Management:**
- User profile management (GET/PUT `/api/users/me`)
- Admin user listing (GET `/api/users`)
- Invite-by-email system (POST `/api/users/invite`)

**Security Features:**
- Secure session validation using Better Auth API
- CSRF protection via Better Auth
- Role-based middleware for admin/user access control
- Automatic session refresh and logout handling
- **Optimized Password Hashing**: Uses Web Crypto API instead of bcrypt for Cloudflare Workers performance
- **Secrets Management**: Sensitive data stored as encrypted environment variables in Cloudflare dashboard

**Developer Experience:**
- Type-safe user context in services via `this.requireUser()`
- Automatic user injection in auth middleware
- Clean separation between authentication and business logic
- Comprehensive error handling with proper HTTP status codes

### Usage Examples

**Backend Service with Auth:**
```typescript
export class UserService extends BaseService<User> {
  async updateMe(data: UpdateUserRequest): Promise<User> {
    const currentUser = this.requireUser() // Gets user from auth context

    return await this.db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, currentUser.id))
      .returning()
      .get()
  }
}
```

**Frontend Auth Usage:**
```typescript
// Primary auth hook - uses Better Auth session
const { user, isAuthenticated, isLoading } = useAuth()

// Logout with proper cleanup
const { logout } = useAuthMutations()
logout.mutate()

// Role-based access
const { isAdmin, hasRole } = usePermissions()
```

### Environment Configuration

**Development (.dev.vars):**
```bash
BETTER_AUTH_SECRET=your-32-character-secret-key
BETTER_AUTH_URL=http://localhost:5173

# Optional OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token
```

**Production (wrangler.jsonc + Cloudflare Dashboard):**
- **Environment Variables** (in wrangler.jsonc): `BETTER_AUTH_URL`, `NODE_ENV`
- **Secrets** (in Cloudflare Dashboard): `BETTER_AUTH_SECRET` (encrypted)
- **Deployment**: Git auto-deployment or `npm run deploy`

## File Organization

```
src/                    # Frontend React application
├── hooks/              # Custom hooks for API and state management
├── routes/             # File-based routing with TanStack Router
└── main.tsx           # App entry point with providers

worker/                 # Backend Hono application
├── container/          # Dependency injection system
│   ├── container.ts    # DI container implementation
│   ├── registry.ts     # Service registration and typed helpers
│   └── tokens.ts       # Service token constants
├── db/                 # Database layer
│   └── schema.ts       # Drizzle schema definitions
├── lib/                # Shared utilities (response helpers, custom errors)
├── middleware/         # Request middleware (CORS, error handling, security)
├── routes/             # API route factories (accept container)
├── schemas/            # Zod validation schemas
├── services/           # Business logic layer with BaseService
└── index.ts           # Main worker entry and AppType export

drizzle/                # Database migrations and metadata
├── meta/               # Migration metadata and journal
├── *.sql              # Generated SQL migration files
└── ...

Configuration files:
├── drizzle.config.ts   # Drizzle configuration with local/remote switching
├── wrangler.jsonc      # Cloudflare Workers configuration with D1 binding
└── worker-configuration.d.ts  # Generated TypeScript definitions
```

## UI Components

When adding new UI components, use Shadcn with the latest version:

```bash
pnpx shadcn@latest add button
```

## Database Architecture (Cloudflare D1 + Drizzle)

This application uses **Cloudflare D1** (SQLite) with **Drizzle ORM** for type-safe database operations. The setup automatically switches between local development and remote production databases.

### Environment Switching

**Development (`npm run dev`):**
- Uses local SQLite database in `.wrangler/state/v3/d1/`
- Data persists locally during development
- Drizzle Studio connects to local database

**Production (`npm run deploy`):**
- Uses remote Cloudflare D1 database
- Data persists in Cloudflare's distributed SQLite
- Drizzle Studio connects to remote database

### Database Configuration

**1. Wrangler Configuration (`wrangler.jsonc`):**
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "fullstack-template",
      "database_id": "your-database-id",
      "migrations_dir": "drizzle"
    }
  ]
}
```

**2. Drizzle Configuration (`drizzle.config.ts`):**
```typescript
export default defineConfig({
  dialect: 'sqlite',
  schema: './worker/db/schema.ts',
  out: './drizzle',
  // Automatically switches between local and remote
  ...(process.env.NODE_ENV === 'production' ? {
    driver: 'd1-http',
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID,
      token: process.env.CLOUDFLARE_D1_TOKEN
    }
  } : {
    dbCredentials: {
      url: getLocalD1DB()  // Finds local SQLite file
    }
  })
})
```

**3. Environment Variables (`.env.local`):**
```bash
# Required for remote D1 operations (migrations, studio)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token
NODE_ENV=development
```

### Database Schema

Define your database structure in `worker/db/schema.ts`:

```typescript
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  bio: text('bio'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})
```

### Migration Workflow

**1. Generate Migration:**
```bash
npx drizzle-kit generate  # Creates SQL migration files
```

**2. Apply to Local D1:**
```bash
# Automatically applied when running npm run dev
npx wrangler d1 execute fullstack-template --local --file=./drizzle/0000_migration.sql
```

**3. Apply to Remote D1:**
```bash
npm run db:migrate:remote  # Uses remote D1 credentials
```

### Database Access in Services

Services automatically get database access through dependency injection:

```typescript
export class UserService extends BaseService<User> {
  async findById(id: string): Promise<User> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    return await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get()
  }
}
```

### Drizzle Studio

Access your database through Drizzle Studio's web interface:

```bash
npx drizzle-kit studio
```

- **Development**: Opens local SQLite database
- **Production**: Opens remote Cloudflare D1 database
- **URL**: Usually `https://local.drizzle.studio`

### Database Debugging

**Check Local Database:**
```bash
npx wrangler d1 execute fullstack-template --local --command="SELECT * FROM users"
```

**Check Remote Database:**
```bash
npx wrangler d1 execute fullstack-template --remote --command="SELECT * FROM users"
```

**Find Local SQLite File:**
```bash
find .wrangler -name "*.sqlite" -type f
```

## Dependency Injection Pattern

### Database Integration

The application integrates Drizzle ORM through dependency injection with automatic D1 binding:

```typescript
// 1. D1 binding is automatically registered in container
// worker/container/registry.ts
const database = env.DB ? drizzle(env.DB) : null
container.registerValue(SERVICE_TOKENS.DATABASE, database)

// 2. Access in services via this.db
export class UserService extends BaseService<User> {
  async findById(id: string): Promise<User> {
    if (!this.db) {
      throw new Error('Database not available')
    }
    return await this.db.select().from(users).where(eq(users.id, id)).get()
  }
}
```

### Adding New Services

1. **Create Service Class** extending BaseService:

```typescript
export class UserService extends BaseService<User> {
  constructor(container?: Container) {
    super(container) // Now gets database access via this.db
  }

  async findById(id: string): Promise<User> {
    // Use this.db for Drizzle queries
    return await this.db.select().from(usersTable).where(eq(usersTable.id, id)).get()
  }
}
```

2. **Register in Container** (`worker/container/registry.ts`):

```typescript
container.register(SERVICE_TOKENS.USER_SERVICE, UserService, { singleton: true })
```

3. **Add Type-Safe Helper**:

```typescript
export function getUserService(container: Container): UserService {
  return container.resolve<UserService>(SERVICE_TOKENS.USER_SERVICE)
}
```

4. **Use in Routes**:

```typescript
export function createUserRoutes(container: Container) {
  return new Hono().get('/:id', async c => {
    const userService = getUserService(container)
    const user = await userService.findById(c.req.param('id'))
    return c.json(createSuccessResponse(user))
  })
}
```

## Error Handling

The application features a comprehensive error handling system:

### Custom Error Classes

- `AppError` - Abstract base class with `statusCode`, `isOperational`, and `errorCode`
- `ValidationError` (400) - Request validation failures with field-specific errors
- `UnauthorizedError` (401) - Authentication required
- `ForbiddenError` (403) - Access forbidden
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Business rule conflicts
- `BusinessLogicError` (422) - Domain-specific validation failures
- `RateLimitError` (429) - Too many requests
- `InternalServerError` (500) - Server errors
- `ExternalServiceError` (502) - Third-party service failures

### Error Middleware

- Global error handler with structured logging
- Unique error IDs for tracking and debugging
- Production-safe error messages (no internal details exposed)
- Request context logging (path, method, user agent, timestamp)
- Special handling for Zod validation errors with field mapping

### Usage in Services

Services throw specific error types instead of returning null/undefined:

```typescript
async findById(id: string): Promise<Todo> {
  const todo = this.todos.find(todo => todo.id === id)
  if (!todo) {
    throw new NotFoundError('Todo')
  }
  return todo
}
```

## Authentication & Authorization

The template includes Better Auth integration with role-based access control:

### Better Auth Integration

```typescript
// 1. Set up Better Auth middleware
import { authMiddleware, requireRole } from '../middleware/auth'

// 2. Create protected routes
import { createProtectedApp, withAuth } from '../lib/auth-helpers'

const protectedApi = createProtectedApp(container).get(
  '/profile',
  withAuth(async (c, container) => {
    // User is automatically injected into services
    const userService = getUserService(container)
    const user = c.get('user') // Current authenticated user
    return c.json(createSuccessResponse(user))
  })
)

// 3. Role-based routes
const adminApi = createAdminApp(container).get(
  '/users',
  withAuth(async (c, container) => {
    // Only admin users can access
    const userService = getUserService(container)
    const users = await userService.getAllUsers()
    return c.json(createSuccessResponse(users))
  })
)
```

### Service-Level Authorization

Services automatically receive user context and provide helper methods:

```typescript
export class TodoService extends BaseService<Todo> {
  async findUserTodos(): Promise<Todo[]> {
    const user = this.requireUser() // Throws if not authenticated

    // Use this.db with user context
    return await this.db.select().from(todosTable).where(eq(todosTable.userId, user.id))
  }

  async deletePost(id: string): Promise<void> {
    this.requireRole('admin') // Throws if not admin
    await this.db.delete(postsTable).where(eq(postsTable.id, id))
  }
}
```

### Available Auth Helpers

- **`createProtectedApp()`** - All routes require authentication
- **`createOptionalAuthApp()`** - Authentication optional, user-aware
- **`createAdminApp()`** - Admin-only routes
- **`createRoleBasedApp(roles)`** - Specific roles required
- **`withAuth(handler)`** - Auto-inject container with user context
- **`this.requireUser()`** - Get current user in services
- **`this.requireRole(role)`** - Require specific role in services

## Type Safety Notes

- Backend route changes automatically propagate types to frontend
- Query parameters must be converted to strings for Hono client
- All API responses follow the global response format for consistency
- Service layer uses generic types for reusable functionality across entities
- DI container provides compile-time type safety for service resolution
- Error handling provides consistent structure across all endpoints
