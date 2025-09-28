# Architecture Cheat Sheet

Quick reference for your DI container setup.

## 🎯 **The 3-Layer Config System**

```
Environment Variables (.dev.vars)
         ↓
App Settings (worker/config/app-settings.ts)
         ↓
Combined Config (worker/config/index.ts)
         ↓
Services get: this.config.yourFeature.setting
```

## 📁 **File Structure by Purpose**

### **Configuration**

```
worker/config/
├── environment.ts      # External secrets (API keys, URLs)
├── app-settings.ts     # Behavioral settings (timeouts, limits)
└── index.ts           # Combines both into AppConfig
```

### **Business Logic**

```
worker/services/
├── base.service.ts     # Common functionality
└── feature.service.ts  # Your business logic
```

### **API Layer**

```
worker/routes/
├── index.ts                 # RPC app with basePath('/api')
├── features/
│   ├── users.ts            # Feature endpoints
│   ├── auth.ts             # Auth endpoints
│   └── health.ts           # Health endpoints
└── openapi/
    ├── index.ts            # OpenAPI app with basePath('/api/v1')
    ├── users.ts            # Documented user endpoints
    ├── auth.ts             # Documented auth endpoints
    └── health.ts           # Documented health endpoints
```

### **Database Layer**

```
worker/db/
└── schema.ts          # Drizzle table definitions

drizzle/
├── meta/              # Migration metadata
├── *.sql              # Generated migrations
└── ...
```

### **Data Contracts**

```
worker/schemas/
└── feature.ts         # Zod validation schemas
```

### **DI Container**

```
worker/container/
├── container.ts       # DI implementation
├── registry.ts        # Service registration (includes D1)
└── tokens.ts          # Service identifiers
```

## 🔄 **The Development Flow**

### **1. Basic Feature with Database (90% of cases)**

```typescript
Database Schema → Zod Schema → Service → Routes
```

### **2. Feature with Configuration**

```typescript
Environment/AppSettings → Config → Schema → Service → Routes
```

### **3. Feature with Toggles**

```typescript
FeatureFlags → Schema → Service → Routes
```

## 🛠 **Code Templates**

### **Database Schema Template**

```typescript
// worker/db/schema.ts
export const features = sqliteTable('features', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})
```

### **Service Template**

```typescript
export class FeatureService extends BaseService<FeatureType> {
  constructor(container?: Container) {
    super(container)

    // Access database: this.db
    // Access config: this.config.yourFeature.setting
    // Access feature flags: this.featureFlags.isEnabled('feature')
    // Access secrets: await this.getSecret('API_KEY')
  }

  async findById(id: string): Promise<FeatureType> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    return await this.db.select().from(features).where(eq(features.id, id)).get()
  }
}
```

### **Routes Template**

```typescript
// Feature-organized routes in worker/routes/features/
export function createFeatureRoutes(container: Container) {
  return new Hono().get('/', zValidator('query', FeatureQuerySchema), async c => {
    const query = c.req.valid('query')
    const service = getFeatureService(container)
    const result = await service.findAll(query)
    return c.json(createPaginatedResponse(result.data, result.pagination))
  })
}
```

### **Registration Template**

```typescript
// In tokens.ts
FEATURE_SERVICE: 'FeatureService'

// In registry.ts
container.register(SERVICE_TOKENS.FEATURE_SERVICE, FeatureService, { singleton: true })

export function getFeatureService(container: Container): FeatureService {
  return container.resolve<FeatureService>(SERVICE_TOKENS.FEATURE_SERVICE)
}
```

## 🤔 **Decision Matrix**

| Need                       | Use                   |
| -------------------------- | --------------------- |
| External API keys          | Environment Variables |
| Timeouts, limits, defaults | App Settings          |
| Toggle feature on/off      | Feature Flags         |
| Runtime secrets            | Secrets Manager       |
| Database tables            | Drizzle Schema        |
| Database operations        | Service with this.db  |
| Business logic             | Service               |
| API endpoints              | Routes                |

## 🚦 **Common Patterns**

### **Check Feature Flag**

```typescript
if (!this.featureFlags.isEnabled('yourFeature')) {
  throw new BusinessLogicError('Feature disabled')
}
```

### **Get Config Setting**

```typescript
const timeout = this.config.yourFeature.timeout
const maxRetries = this.config.yourFeature.maxRetries
```

### **Get Secret**

```typescript
const apiKey = await this.getRequiredSecret('API_KEY')
const optionalKey = await this.getSecret('OPTIONAL_KEY', 'default')
```

### **Access Database (Cloudflare D1 + Drizzle)**

```typescript
// Check if database is available
if (!this.db) {
  throw new Error('Database not available')
}

// Basic queries
const users = await this.db.select().from(usersTable)
const user = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).get()

// Insert
await this.db.insert(usersTable).values({ id: '1', name: 'John' })

// Update
await this.db.update(usersTable).set({ name: 'Jane' }).where(eq(usersTable.id, id))
```

### **Database Development Commands**

```bash
npx drizzle-kit studio    # Open database browser (auto-detects local/remote)
npx drizzle-kit generate  # Generate migrations from schema changes
npx drizzle-kit migrate   # Apply migrations to remote D1
```

## ⚠️ **Common Mistakes**

❌ **Don't do this:**

- Skip schema definition
- Put secrets in app settings
- Create services without extending BaseService
- Forget to register services in container

✅ **Do this:**

- Define schema first
- Use environment variables for secrets
- Extend BaseService for full functionality
- Always register services and create typed helpers

## 🎯 **Remember**

- **Start simple**: Schema → Service → Routes
- **Add complexity only when needed**
- **Your factory pattern is perfect for RPC**
- **Config/flags/secrets are optional enhancements**
