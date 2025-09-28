import { developmentSettings } from './development.settings'
import { productionSettings } from './production.settings'
import { stagingSettings } from './staging.settings'

export interface AppSettings {
  // Application metadata
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }

  // Database configuration
  database: {
    maxConnections: number
    queryTimeout: number
    enableLogging: boolean
    retryAttempts: number
  }

  // Authentication settings
  auth: {
    sessionDuration: number // milliseconds
    tokenExpiry: number // milliseconds
    requireEmailVerification: boolean
    allowedDomains?: string[]
  }

  // Feature flags
  features: {
    registration: boolean
    oauth: boolean
    emailVerification: boolean
    maintenanceMode: boolean
    betaFeatures: boolean
  }

  // Rate limiting
  rateLimit: {
    requests: number
    windowMs: number
    skipSuccessfulRequests: boolean
    skipFailedRequests: boolean
  }

  // Logging configuration
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableRequestLogging: boolean
    enableErrorTracking: boolean
    maxLogSize: number
  }

  // Email templates and settings
  email: {
    from: string
    replyTo?: string
    templates: {
      welcome: string
      passwordReset: string
      emailVerification: string
    }
  }

  // Performance settings
  performance: {
    enableCaching: boolean
    cacheTimeout: number
    enableCompression: boolean
  }

  // Security settings
  security: {
    corsOrigins: string[]
    allowedHosts: string[]
    enableCSP: boolean
    rateLimitStrict: boolean
  }
}

// Get settings based on environment
export function getAppSettings(
  environment: string = 'development'
): AppSettings {
  switch (environment) {
    case 'production':
      return productionSettings
    case 'staging':
      return stagingSettings
    case 'development':
    default:
      return developmentSettings
  }
}

// Helper to override settings
export function mergeSettings(
  baseSettings: AppSettings,
  overrides: Partial<AppSettings>
): AppSettings {
  return {
    ...baseSettings,
    ...overrides,
    // Deep merge nested objects
    app: { ...baseSettings.app, ...overrides.app },
    database: { ...baseSettings.database, ...overrides.database },
    auth: { ...baseSettings.auth, ...overrides.auth },
    features: { ...baseSettings.features, ...overrides.features },
    rateLimit: { ...baseSettings.rateLimit, ...overrides.rateLimit },
    logging: { ...baseSettings.logging, ...overrides.logging },
    email: {
      ...baseSettings.email,
      ...overrides.email,
      templates: {
        ...baseSettings.email.templates,
        ...overrides.email?.templates,
      },
    },
    performance: { ...baseSettings.performance, ...overrides.performance },
    security: { ...baseSettings.security, ...overrides.security },
  }
}

export { developmentSettings, productionSettings, stagingSettings }
