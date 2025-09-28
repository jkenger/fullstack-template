# Full-Stack TypeScript Template API Documentation

## Architecture Overview

Full-stack TypeScript application with **Cloudflare Workers**, **React 19**, **Drizzle ORM**, and **Cloudflare D1**.

### Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Query, Vite
- **Backend**: Hono, Cloudflare Workers, Zod validation
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **API**: Dual RPC + OpenAPI architecture

## Quick Start

```bash
# Development
npm run dev                     # Start local server with local D1
npm run build                   # Build for production
npm run deploy                  # Deploy to Cloudflare

# Database
npx drizzle-kit studio          # Open database browser
npx drizzle-kit generate        # Generate migrations
npx drizzle-kit migrate         # Apply to remote D1
```

## Database (Cloudflare D1 + Drizzle)

### Environment Switching
- **Development**: Local SQLite in `.wrangler/state/v3/d1/`
- **Production**: Remote Cloudflare D1 database

### Configuration
```typescript
// wrangler.jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "fullstack-template",
    "database_id": "your-id",
    "migrations_dir": "drizzle"
  }]
}
```

### Schema Example
```typescript
// worker/db/schema.ts
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  // ...
})
```

## Route Architecture

The API implements a dual architecture with feature-organized routes:

### RPC Routes (`/api/*`) - Type-Safe Frontend Integration

- **Users**: `/api/users/me` (GET, PUT)
- **Auth**: `/api/auth/info` (GET)
- **Health**: `/api/health` (GET)

### OpenAPI Routes (`/api/v1/*`) - External API Documentation

- **Users**: `/api/v1/users/me` (GET, PUT)
- **Auth**: `/api/v1/auth/info` (GET)
- **Health**: `/api/v1/health` (GET)

## Interactive Documentation

- **Swagger UI**: [http://localhost:5173/api/v1/docs](http://localhost:5173/api/v1/docs)
- **ReDoc**: [http://localhost:5173/api/v1/redoc](http://localhost:5173/api/v1/redoc)
- **OpenAPI Spec**: [http://localhost:5173/api/v1/openapi.json](http://localhost:5173/api/v1/openapi.json)
- **Drizzle Studio**: [https://local.drizzle.studio](https://local.drizzle.studio)

## Environment Setup

Create `.env.local`:
```bash
# Required for remote D1 operations
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token
NODE_ENV=development
```

Visit the interactive docs for complete API details, examples, and testing interface.
