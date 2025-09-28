# Feature-Organized Routes

This directory contains routes organized by feature/domain using **native Hono patterns** to maintain full type safety and RPC compatibility.

## Structure

```
features/
├── users.ts    # All user-related routes (/users/*)
├── auth.ts     # All authentication routes (/auth/*)
├── health.ts   # System health and utility routes
└── README.md   # This file
```

## Design Principles

### ✅ What This Approach Provides:
- **Full Type Safety**: Native Hono patterns preserve RPC type inference
- **Feature Organization**: Related routes grouped by domain
- **RPC Compatibility**: `client.api.users.me.$get()` works perfectly
- **Easy Navigation**: Find all user routes in `users.ts`
- **Maintainable**: Clear separation of concerns by feature

### 🚫 What We Avoid:
- File-per-route splitting (breaks type safety)
- Route abstraction layers (breaks RPC)
- Dynamic route composition (breaks inference)

## Route File Pattern

Each feature file exports a function that returns a Hono instance:

```typescript
// features/users.ts
export function createUserRoutes(container: Container) {
  return new Hono()
    .get('/me', async (c) => { /* handler */ })
    .put('/me', zValidator('json', Schema), async (c) => { /* handler */ })
    .get('/profile', async (c) => { /* handler */ })
    // All user routes in one place
}
```

## Registration Pattern

Features are registered in the main routes file:

```typescript
// routes/index.ts
export function createApiRoutes(container: Container) {
  return new Hono()
    .route('/users', createUserRoutes(container))
    .route('/auth', createAuthRoutes(container))
    // etc.
}
```

## Adding New Features

1. **Create feature file**: `features/newfeature.ts`
2. **Follow the pattern**:
   ```typescript
   export function createNewFeatureRoutes(container: Container) {
     return new Hono()
       .get('/endpoint', handler)
       .post('/endpoint', validator, handler)
   }
   ```
3. **Register in index.ts**: `.route('/newfeature', createNewFeatureRoutes(container))`

## Examples

### User Routes (`/api/users/*`)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### Auth Routes (`/api/auth/*`)
- `GET /api/auth/info` - Auth system info (placeholder)

### System Routes (`/api/*`)
- `GET /api/health` - Health check
- `GET /api/test` - API test endpoint

## Benefits Over File-Per-Route

| Aspect | File-Per-Route | Feature-Organized |
|--------|----------------|-------------------|
| Type Safety | ❌ Broken | ✅ Full |
| RPC Support | ❌ Broken | ✅ Full |
| Organization | ✅ Very Clear | ✅ Clear |
| Maintenance | ⚠️ Many Files | ✅ Manageable |
| Performance | ⚠️ Build Overhead | ✅ Fast |

## Best Practices

1. **Keep related routes together** - All user operations in `users.ts`
2. **Use descriptive function names** - `createUserRoutes`, not `userRoutes`
3. **Group by domain, not by HTTP method**
4. **Add comments for complex routes**
5. **Use consistent validation patterns**

This approach gives you the organization benefits of file-based routing while maintaining Hono's excellent type safety and RPC features.