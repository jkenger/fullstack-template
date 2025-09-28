# Feature Development Guide

This guide shows you **exactly when and how** to use each part of your architecture when building
new features.

## 🎯 The Decision Tree: "What Do I Need?"

When starting a new feature, ask these questions in order:

### 1. **Do I need external secrets?**

- API keys, database URLs, auth secrets
- **YES** → Add to environment config
- **NO** → Skip environment setup

### 2. **Do I need behavioral settings?**

- Timeouts, limits, default values that change by environment
- **YES** → Add to app settings
- **NO** → Skip app settings

### 3. **Do I want to toggle this feature on/off?**

- Beta features, maintenance mode, gradual rollout
- **YES** → Add feature flag
- **NO** → Skip feature flags

### 4. **Do I need database tables?**

- Store data persistently
- **YES** → Create Drizzle schema and migrations
- **NO** → Skip database setup

### 5. **Do I have business logic?**

- Data processing, validation, complex operations
- **YES** → Create service
- **NO** → Put logic directly in routes

### 6. **Do I need API endpoints?**

- External access to your feature
- **YES** → Create routes
- **NO** → Service only

---

## 🚀 Step-by-Step Feature Development

### Example: Building a "Notifications" Feature

Let's walk through building a notification system step by step:

#### **Step 1: Environment Variables** (if needed)

_Ask: Do I need external secrets?_

- Email SMTP credentials ✅
- Push notification API keys ✅

```typescript
// worker/config/environment.ts
export interface Environment {
  // ... existing fields

  // Add notification secrets
  SMTP_HOST?: string
  SMTP_PORT?: number
  SMTP_USER?: string
  SMTP_PASS?: string
  PUSH_API_KEY?: string
}

// Update validation
const environmentSchema = z.object({
  // ... existing
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  PUSH_API_KEY: z.string().optional(),
})
```

#### **Step 2: App Settings** (if needed)

_Ask: Do I need behavioral settings?_

- Retry attempts ✅
- Rate limits ✅
- Default notification types ✅

```typescript
// worker/config/app-settings.ts
interface AppSettings {
  // ... existing
  notifications: {
    maxRetries: number
    rateLimitPerHour: number
    defaultTypes: string[]
    enableEmail: boolean
    enablePush: boolean
  }
}

// Add to each environment
development: {
  // ... existing
  notifications: {
    maxRetries: 3,
    rateLimitPerHour: 100,
    defaultTypes: ['email'],
    enableEmail: true,
    enablePush: false, // Disabled in dev
  }
}
```

#### **Step 3: Combined Config** (if you added settings)

_Update the main config to include your new settings_

```typescript
// worker/config/index.ts
export interface AppConfig {
  // ... existing
  notifications: {
    smtp?: {
      host?: string
      port?: number
      user?: string
      pass?: string
    }
    pushApiKey?: string
    maxRetries: number
    rateLimitPerHour: number
    defaultTypes: string[]
    enableEmail: boolean
    enablePush: boolean
  }
}

// Update createConfig function
export function createConfig(env: Record<string, unknown>): AppConfig {
  // ... existing code

  return {
    // ... existing
    notifications: {
      // From environment
      smtp: environment.SMTP_HOST
        ? {
            host: environment.SMTP_HOST,
            port: environment.SMTP_PORT,
            user: environment.SMTP_USER,
            pass: environment.SMTP_PASS,
          }
        : undefined,
      pushApiKey: environment.PUSH_API_KEY,

      // From app settings
      maxRetries: appSettings.notifications.maxRetries,
      rateLimitPerHour: appSettings.notifications.rateLimitPerHour,
      defaultTypes: appSettings.notifications.defaultTypes,
      enableEmail: appSettings.notifications.enableEmail,
      enablePush: appSettings.notifications.enablePush,
    },
  }
}
```

#### **Step 4: Feature Flags** (if needed)

_Ask: Do I want to toggle this feature?_

- New notification system ✅
- Email vs Push preference ✅

```typescript
// worker/lib/feature-flags.ts
const DEFAULT_FLAGS = {
  // ... existing
  notifications: true,
  notificationsV2: false, // New version in beta
  emailNotifications: true,
  pushNotifications: false, // Gradual rollout
}
```

#### **Step 5: Database Schema** (if you need persistence)

_Define your database structure first_

```typescript
// worker/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'email', 'push', 'sms'
  title: text('title').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'sent', 'failed'
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  sentAt: text('sent_at'),
})

// Generate migration
// npx drizzle-kit generate
```

#### **Step 6: Zod Schema** (always needed for APIs)

_Define your API data structure_

```typescript
// worker/schemas/notification.ts
import { z } from 'zod'

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['email', 'push', 'sms']),
  title: z.string(),
  message: z.string(),
  status: z.enum(['pending', 'sent', 'failed']),
  createdAt: z.string(),
  sentAt: z.string().optional(),
})

export const CreateNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(['email', 'push', 'sms']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
})

export const NotificationQuerySchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['email', 'push', 'sms']).optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export type Notification = z.infer<typeof NotificationSchema>
export type CreateNotificationRequest = z.infer<typeof CreateNotificationSchema>
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>
```

#### **Step 7: Service** (if you have business logic)

_Ask: Do I have business logic?_

- Send notifications ✅
- Retry logic ✅
- Rate limiting ✅

```typescript
// worker/services/notification.service.ts
import { BaseService, type PaginatedResult } from './base.service'
import type { Container } from '../container/container'
import type {
  Notification,
  CreateNotificationRequest,
  NotificationQuery,
} from '../schemas/notification'
import { NotFoundError, BusinessLogicError } from '../lib/errors'

export class NotificationService extends BaseService<Notification> {
  constructor(container?: Container) {
    super(container)

    // Check if feature is enabled
    if (!this.featureFlags.isEnabled('notifications')) {
      throw new BusinessLogicError('Notifications are disabled')
    }
  }

  async findAll(query: NotificationQuery): Promise<PaginatedResult<Notification>> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    let dbQuery = this.db.select().from(notifications)

    // Apply filters
    if (query.userId) {
      dbQuery = dbQuery.where(eq(notifications.userId, query.userId))
    }
    // Add more filters as needed

    const results = await dbQuery

    // Apply pagination (this is simplified - in real app, use SQL LIMIT/OFFSET)
    return this.applyPagination(results, {
      page: query.page,
      limit: query.limit,
    })
  }

  async create(data: CreateNotificationRequest): Promise<Notification> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    // Check feature flag for specific notification type
    if (data.type === 'email' && !this.featureFlags.isEnabled('emailNotifications')) {
      throw new BusinessLogicError('Email notifications are disabled')
    }

    if (data.type === 'push' && !this.featureFlags.isEnabled('pushNotifications')) {
      throw new BusinessLogicError('Push notifications are disabled')
    }

    // Check if notification type is enabled in config
    if (data.type === 'email' && !this.config.notifications.enableEmail) {
      throw new BusinessLogicError('Email notifications not configured')
    }

    // Rate limiting check - query recent notifications from database
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recentNotifications = await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, data.userId), gte(notifications.createdAt, oneHourAgo)))

    if (recentNotifications.length >= this.config.notifications.rateLimitPerHour) {
      throw new BusinessLogicError('Rate limit exceeded')
    }

    const newNotification = {
      id: crypto.randomUUID(),
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }

    // Insert into database
    const [createdNotification] = await this.db
      .insert(notifications)
      .values(newNotification)
      .returning()

    // Send the notification (in background)
    this.sendNotification(createdNotification).catch(error => {
      console.error('Failed to send notification:', error)
      // Update status to failed in database
      this.db
        .update(notifications)
        .set({ status: 'failed' })
        .where(eq(notifications.id, createdNotification.id))
        .execute()
    })

    return createdNotification
  }

  private async sendNotification(notification: Notification): Promise<void> {
    const maxRetries = this.config.notifications.maxRetries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (notification.type === 'email') {
          await this.sendEmail(notification)
        } else if (notification.type === 'push') {
          await this.sendPush(notification)
        }

        // Mark as sent in database
        await this.db
          .update(notifications)
          .set({ status: 'sent', sentAt: new Date().toISOString() })
          .where(eq(notifications.id, notification.id))
        return
      } catch (error) {
        console.error(`Notification send attempt ${attempt} failed:`, error)
        if (attempt === maxRetries) {
          throw error
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    const smtpConfig = this.config.notifications.smtp
    if (!smtpConfig) {
      throw new Error('SMTP not configured')
    }

    // In real implementation, use nodemailer or similar
    console.log('Sending email notification:', notification)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private async sendPush(notification: Notification): Promise<void> {
    const apiKey = this.config.notifications.pushApiKey
    if (!apiKey) {
      throw new Error('Push API key not configured')
    }

    // In real implementation, call push service API
    console.log('Sending push notification:', notification)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
```

#### **Step 8: Register Service** (if you created one)

```typescript
// worker/container/tokens.ts
export const SERVICE_TOKENS = {
  // ... existing
  NOTIFICATION_SERVICE: 'NotificationService',
} as const

// worker/container/registry.ts
import { NotificationService } from '../services/notification.service'

export function createContainer(env?: Record<string, unknown>): Container {
  // ... existing code

  // Register notification service
  container.register(SERVICE_TOKENS.NOTIFICATION_SERVICE, NotificationService, {
    singleton: true,
  })

  return container
}

// Add typed helper
export function getNotificationService(container: Container): NotificationService {
  return container.resolve<NotificationService>(SERVICE_TOKENS.NOTIFICATION_SERVICE)
}
```

#### **Step 9: Routes** (if you need API endpoints)

```typescript
// worker/routes/features/notifications.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreateNotificationSchema, NotificationQuerySchema } from '../schemas/notification'
import { createSuccessResponse, createPaginatedResponse } from '../lib/response'
import { getNotificationService } from '../container/registry'
import type { Container } from '../container/container'

export function createNotificationRoutes(container: Container) {
  return new Hono()
    .get('/', zValidator('query', NotificationQuerySchema), async c => {
      const query = c.req.valid('query')
      const notificationService = getNotificationService(container)
      const result = await notificationService.findAll(query)

      return c.json(createPaginatedResponse(result.data, result.pagination))
    })

    .post('/', zValidator('json', CreateNotificationSchema), async c => {
      const data = c.req.valid('json')
      const notificationService = getNotificationService(container)

      const notification = await notificationService.create(data)

      return c.json(createSuccessResponse(notification, 'Notification created successfully'), 201)
    })
}
```

#### **Step 10: Register Routes**

```typescript
// worker/routes/index.ts
import { createNotificationRoutes } from './notifications'

export function createApiRoutes(container: Container) {
  return (
    new Hono()
      // ... existing routes
      .route('/notifications', createNotificationRoutes(container))
  )
}
```

---

## 🤔 **When NOT to Use Each Part**

### **Skip Environment Variables When:**

- No external secrets needed
- Everything can be hardcoded safely

### **Skip App Settings When:**

- No behavioral differences between environments
- Simple feature with no configuration

### **Skip Feature Flags When:**

- Feature is always on
- No gradual rollout needed
- Not experimental

### **Skip Secrets Manager When:**

- All secrets are in environment variables
- No runtime/user-specific secrets

### **Skip Services When:**

- Simple CRUD with no business logic
- Just passing data through
- Very basic operations

---

## 📋 **Quick Checklist**

For any new feature, go through this checklist:

- [ ] **Environment Variables**: Do I need external secrets?
- [ ] **App Settings**: Do I need behavioral configuration?
- [ ] **Config Update**: If I added either above, update main config
- [ ] **Feature Flags**: Do I want to toggle this on/off?
- [ ] **Database Schema**: Do I need to store data? (Drizzle schema + migration)
- [ ] **Zod Schema**: Define API data structure (always needed for APIs)
- [ ] **Service**: Do I have business logic?
- [ ] **Service Registration**: If service created, register it
- [ ] **Routes**: Do I need API endpoints?
- [ ] **Route Registration**: If routes created, register them

---

## 🎯 **The Golden Rule**

**Start simple, add complexity only when needed.**

Most features only need: **Database Schema → Zod Schema → Service → Routes**

The rest (config, feature flags, secrets) are **optional enhancements** you add when you actually
need them.

Don't feel like you have to use everything for every feature!

### **Database Development Flow**

1. **Design** → Define Drizzle schema
2. **Generate** → `npx drizzle-kit generate` (creates migration)
3. **Develop** → Work with local D1 (`npm run dev`)
4. **Deploy** → `npx drizzle-kit migrate` (applies to remote D1)
5. **Inspect** → `npx drizzle-kit studio` (browse data)
