# Full-Stack TypeScript Template

A modern, production-ready full-stack template with React 19, Hono, Cloudflare Workers, and Better
Auth.

## ✨ Features

- **Frontend**: React 19 + TanStack Router + TanStack Query + Tailwind CSS
- **Backend**: Hono + Cloudflare Workers + Drizzle ORM + D1 SQLite
- **Authentication**: Better Auth with email/password + OAuth (GitHub, Google)
- **Type Safety**: End-to-end type safety with Hono RPC
- **Database**: Cloudflare D1 with automatic local/remote switching
- **UI**: Shadcn/ui components with dark mode support
- **API Docs**: Auto-generated OpenAPI documentation

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd fullstack-template
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .dev.vars

# Fill in your values in .dev.vars:
# - BETTER_AUTH_SECRET (generate a 32+ character random string)
# - BETTER_AUTH_URL=http://localhost:5173
# - Cloudflare credentials (for database operations)
```

### 3. Database Setup

```bash
# Generate and apply migrations
npm run db:generate
npm run db:push # Apply to local db
npm run db:migrate:remote  # Apply to remote D1
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` - your app is ready! 🎉

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:generate     # Generate migrations
npm run db:migrate:remote # Apply migrations to remote D1
npm run db:studio       # Open Drizzle Studio

# Deployment
npm run deploy          # Deploy to production
npm run deploy:staging  # Deploy to staging

# Code Quality
npm run lint            # Lint codebase
npm run typecheck       # Type checking
npm run test            # Run tests
```

## 🔐 Production Setup

### 1. Cloudflare Dashboard

- Set `BETTER_AUTH_SECRET` as an **encrypted environment variable**
- Other variables are configured in `wrangler.jsonc`

### 2. Deploy

```bash
npm run deploy
```

### 3. Git Auto-Deployment

The template supports git auto-deployment - just push to main branch!

## 🏗️ Architecture

- **Type-Safe API**: Hono RPC provides end-to-end type safety
- **Authentication**: Better Auth with optimized password hashing for Workers
- **Database**: D1 SQLite with Drizzle ORM and automatic migrations
- **Dependency Injection**: Clean service layer with container pattern
- **Error Handling**: Comprehensive error handling with structured logging

## 🛠️ Tech Stack

**Frontend:**

- React 19 + TypeScript
- TanStack Router (file-based routing)
- TanStack Query (server state)
- Tailwind CSS + Shadcn/ui
- Vite (bundling)

**Backend:**

- Hono (web framework)
- Cloudflare Workers (runtime)
- Drizzle ORM (database)
- Better Auth (authentication)
- Zod (validation)

**Database & Infrastructure:**

- Cloudflare D1 (SQLite)
- Cloudflare Workers (serverless)
- Git auto-deployment

## 📁 Project Structure

```
src/                    # React frontend
├── hooks/              # API hooks with TanStack Query
├── routes/             # File-based routes with TanStack Router
└── main.tsx           # App entry point

worker/                 # Hono backend
├── config/             # Configuration system
│   ├── environment.ts  # Environment variables & secrets validation
│   ├── app-settings.ts # Application behavior settings by environment
│   └── index.ts        # Combined configuration interface
├── container/          # Dependency injection system
├── lib/                # Utilities (response helpers, custom errors)
├── middleware/         # Error handling, security, validation
├── services/           # Business logic with BaseService
├── routes/             # API route handlers
├── schemas/            # Zod validation schemas
└── index.ts           # Worker entry point
```

## ⚙️ Configuration System

The template features a clean, organized configuration system with proper separation of concerns:

### **Configuration Structure**

```
worker/config/
├── environment.ts      # Environment variables & secrets validation
├── app-settings.ts     # Application behavior settings by environment
└── index.ts           # Combined configuration interface
```

### **1. Environment Variables (.dev.vars) - Secrets Only**

Only external dependencies and secrets:

```bash
# Environment identifier
NODE_ENV=development

# Authentication secrets
BETTER_AUTH_SECRET=your-32-character-secret-key-here-for-development-only
BETTER_AUTH_URL=http://localhost:8787

# OAuth Provider credentials
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# External API keys
API_KEY=dev-api-key-for-local-testing
WEBHOOK_SECRET=dev-webhook-secret-16-chars

# Email service credentials
# SMTP_HOST=smtp.mailtrap.io
# SMTP_USER=your-smtp-user
# SMTP_PASS=your-smtp-password
```

### **2. Application Settings (worker/config/app-settings.ts)**

Environment-specific application behavior:

```typescript
// Automatically selected based on NODE_ENV
export const developmentSettings: AppSettings = {
  app: { name: 'Modern Template', version: '1.0.0', environment: 'development' },
  database: { maxConnections: 5, queryTimeout: 10000, enableLogging: true },
  features: { registration: true, oauth: false, betaFeatures: true },
  rateLimit: { requests: 1000, windowMs: 60000 },
  logging: { level: 'debug', enableRequestLogging: true },
  security: { corsOrigins: ['http://localhost:5173'], enableCSP: false },
  // ... more settings
}
```

### **3. Combined Configuration**

Environment variables + app settings merged into structured config:

```typescript
// Automatically combines env vars with app settings
const config = createConfig(env)

// Access in services
class TodoService extends BaseService {
  constructor(container: Container) {
    super(container)

    // App settings
    console.log('Max connections:', this.config.database.maxConnections)
    console.log('Environment:', this.config.app.environment)

    // Environment secrets
    const apiKey = this.config.external.apiKey
    const authSecret = this.config.auth.secret

    // Feature flags
    if (this.config.features.betaFeatures) {
      // Beta feature logic
    }
  }
}
```

### **Benefits of This Structure**

- ✅ **Clear separation**: Secrets in env vars, behavior in app settings
- ✅ **Environment-specific**: Different settings for dev/staging/prod
- ✅ **Type-safe**: Full TypeScript validation throughout
- ✅ **Easy to modify**: Change app behavior without touching env vars
- ✅ **Version controlled**: App settings are committed, secrets are not

## 🔧 Development

### Adding New Features

1. **Define Schema** (Zod validation + TypeScript types)
2. **Create Service** (Business logic extending BaseService)
3. **Register Service** (In DI container)
4. **Create Routes** (Route factories with service injection)
5. **Frontend Hook** (Type-safe API hook with TanStack Query)

### Example: Adding User Management

```typescript
// 1. Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
})

// 2. Service
export class UserService extends BaseService<User> {
  async findById(id: string): Promise<User | null> {
    // Business logic
  }
}

// 3. Register
container.register(SERVICE_TOKENS.USER_SERVICE, UserService)

// 4. Routes
export function createUserRoutes(container: Container) {
  return new Hono().get('/:id', async c => {
    const userService = getUserService(container)
    const user = await userService.findById(c.req.param('id'))
    return c.json(createSuccessResponse(user))
  })
}

// 5. Frontend Hook
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await client.api.users[':id'].$get({ param: { id } })
      return await res.json()
    },
  })
}
```

## 📚 Learn More

- [Hono Documentation](https://hono.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md).
# fullstack-template
