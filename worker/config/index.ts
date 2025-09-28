// Main configuration file - combines environment variables with app settings

import type { Environment } from './environment'
import type { AppSettings } from './app-settings'
import {
  validateEnvironment,
  validateProductionEnvironment,
} from './environment'
import { getAppSettings } from './app-settings'

// Combined application configuration
export interface AppConfig {
  // App metadata (from app settings)
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }

  // Database configuration (combines env vars + app settings)
  database: {
    url?: string
    maxConnections: number
    queryTimeout: number
    enableLogging: boolean
    retryAttempts: number
  }

  // Authentication (combines env secrets + app settings)
  auth: {
    secret?: string
    baseUrl?: string
    sessionDuration: number
    tokenExpiry: number
    requireEmailVerification: boolean
    oauth: {
      github: { clientId?: string; clientSecret?: string }
      google: { clientId?: string; clientSecret?: string }
    }
  }

  // Email configuration (combines SMTP env vars + app settings)
  email: {
    smtp?: {
      host?: string
      port?: number
      user?: string
      pass?: string
    }
    from: string
    replyTo?: string
    templates: {
      welcome: string
      passwordReset: string
      emailVerification: string
    }
  }

  // Feature flags (from app settings)
  features: {
    registration: boolean
    oauth: boolean
    emailVerification: boolean
    maintenanceMode: boolean
    betaFeatures: boolean
  }

  // Rate limiting (from app settings)
  rateLimit: {
    requests: number
    windowMs: number
    skipSuccessfulRequests: boolean
    skipFailedRequests: boolean
  }

  // Logging (from app settings)
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableRequestLogging: boolean
    enableErrorTracking: boolean
    maxLogSize: number
  }

  // Performance settings (from app settings)
  performance: {
    enableCaching: boolean
    cacheTimeout: number
    enableCompression: boolean
  }

  // Security settings (from app settings)
  security: {
    corsOrigins: string[]
    allowedHosts: string[]
    enableCSP: boolean
    rateLimitStrict: boolean
  }

  // API documentation configuration (from app settings)
  api: {
    openapi: {
      version: string
      title: string
      description: string
      contact: {
        name: string
        email: string
      }
      license: {
        name: string
        url: string
      }
      servers: Array<{
        url: string
        description: string
      }>
      tags: Array<{
        name: string
        description: string
      }>
    }
  }

  // External API keys (from env vars)
  external: {
    apiKey?: string
    webhookSecret?: string
    sentryDsn?: string
    redisUrl?: string
  }
}

// Create complete configuration by merging environment variables and app settings
export function createConfig(env: Environment): AppConfig {
  // Validate environment variables first
  const environment = validateEnvironment(env)

  // Get app settings based on environment
  const appSettings = getAppSettings(environment.NODE_ENV)

  // Validate production requirements
  if (environment.NODE_ENV === 'production') {
    validateProductionEnvironment(environment)
  }

  // Merge everything together
  return {
    // App metadata
    app: appSettings.app,

    // Database (combine env vars with app settings)
    database: {
      url: environment.DATABASE_URL,
      maxConnections: appSettings.database.maxConnections,
      queryTimeout: appSettings.database.queryTimeout,
      enableLogging: appSettings.database.enableLogging,
      retryAttempts: appSettings.database.retryAttempts,
    },

    // Authentication (combine env secrets with app settings)
    auth: {
      secret: environment.BETTER_AUTH_SECRET,
      baseUrl: environment.BETTER_AUTH_URL,
      sessionDuration: appSettings.auth.sessionDuration,
      tokenExpiry: appSettings.auth.tokenExpiry,
      requireEmailVerification: appSettings.auth.requireEmailVerification,
      oauth: {
        github: {
          clientId: environment.GITHUB_CLIENT_ID,
          clientSecret: environment.GITHUB_CLIENT_SECRET,
        },
        google: {
          clientId: environment.GOOGLE_CLIENT_ID,
          clientSecret: environment.GOOGLE_CLIENT_SECRET,
        },
      },
    },

    // Email (combine SMTP env vars with app settings)
    email: {
      smtp: environment.SMTP_HOST
        ? {
            host: environment.SMTP_HOST,
            port: environment.SMTP_PORT,
            user: environment.SMTP_USER,
            pass: environment.SMTP_PASS,
          }
        : undefined,
      from: appSettings.email.from,
      replyTo: appSettings.email.replyTo,
      templates: appSettings.email.templates,
    },

    // Feature flags (from app settings)
    features: appSettings.features,

    // Rate limiting (from app settings)
    rateLimit: appSettings.rateLimit,

    // Logging (from app settings)
    logging: appSettings.logging,

    // Performance (from app settings)
    performance: appSettings.performance,

    // Security (from app settings)
    security: appSettings.security,

    // API documentation (from app settings)
    api: appSettings.api,

    // External API keys (from env vars)
    external: {
      apiKey: environment.API_KEY,
      webhookSecret: environment.WEBHOOK_SECRET,
      sentryDsn: environment.SENTRY_DSN,
      redisUrl: environment.REDIS_URL,
    },
  }
}

// Helper functions for backward compatibility
export function validateEnv(env: Environment) {
  return validateEnvironment(env)
}

export function requireEnvVar(key: string, config: AppConfig): string {
  // This would need to be updated based on the specific config structure
  // For now, return a placeholder to avoid breaking existing code
  console.log(key, config)
  throw new Error(`requireEnvVar needs to be updated for new config structure`)
}

// Re-export types and utilities
export type { Environment, AppSettings }
export { getAppSettings } from './app-settings'
export {
  validateEnvironment,
  validateProductionEnvironment,
} from './environment'
