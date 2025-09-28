import { z } from 'zod'

// Import Cloudflare types from generated worker configuration
import type { D1Database, KVNamespace } from '@cloudflare/workers-types'

// Environment validation schema - External dependencies & secrets only
export const EnvironmentSchema = z.object({
  // Cloudflare Bindings
  DB: z.custom<D1Database>().optional(), // D1 Database binding
  KV: z.custom<KVNamespace>().optional(), // KV Store binding

  // Environment identifier
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  // External Database (if not using D1)
  DATABASE_URL: z.string().optional(),

  // Authentication secrets (Better Auth)
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),

  // OAuth Provider credentials
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email service credentials (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // External API keys & secrets
  API_KEY: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),

  // External service URLs
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),

  // Cloudflare D1 HTTP API credentials (for Drizzle migrations)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_DATABASE_ID: z.string().optional(),
  CLOUDFLARE_D1_TOKEN: z.string().optional(),
})

export type Environment = z.infer<typeof EnvironmentSchema>

// Validate and parse environment variables
export function validateEnvironment(env: Environment): Environment {
  try {
    return EnvironmentSchema.parse(env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:', error.issues)
      // In development, log issues but don't crash
      if (env?.NODE_ENV === 'development') {
        return EnvironmentSchema.parse({}) // Use defaults
      }
      throw new Error(`Environment validation failed: ${error.message}`)
    }
    throw error
  }
}

// Production environment validation
export function validateProductionEnvironment(env: Environment): void {
  if (env.NODE_ENV === 'production') {
    // Check for required secrets in production
    if (!env.BETTER_AUTH_SECRET) {
      throw new Error('BETTER_AUTH_SECRET is required in production')
    }

    if (env.BETTER_AUTH_SECRET.length < 32) {
      throw new Error(
        'BETTER_AUTH_SECRET must be at least 32 characters in production'
      )
    }

    // Ensure we have either D1 binding or database URL
    if (!env.DB) {
      console.warn('No DB binding found in production environment')
    }
  }
}
