// Application settings - configurable behavior per environment

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

// Development settings
export const developmentSettings: AppSettings = {
  app: {
    name: 'Modern Template',
    version: '1.0.0',
    environment: 'development',
  },
  database: {
    maxConnections: 5,
    queryTimeout: 10000, // 10 seconds
    enableLogging: true,
    retryAttempts: 3,
  },
  auth: {
    sessionDuration: 24 * 60 * 60 * 1000, // 1 day
    tokenExpiry: 15 * 60 * 1000, // 15 minutes
    requireEmailVerification: false,
    allowedDomains: ['localhost', '127.0.0.1'],
  },
  features: {
    registration: true,
    oauth: false, // Simpler for dev
    emailVerification: false,
    maintenanceMode: false,
    betaFeatures: true, // All beta features enabled in dev
  },
  rateLimit: {
    requests: 1000, // Generous for development
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  logging: {
    level: 'debug',
    enableRequestLogging: true,
    enableErrorTracking: true,
    maxLogSize: 1024 * 1024, // 1MB
  },
  email: {
    from: 'dev@yourapp.com',
    replyTo: 'dev@yourapp.com',
    templates: {
      welcome: 'Welcome to our app (Dev)',
      passwordReset: 'Password reset (Dev)',
      emailVerification: 'Verify your email (Dev)',
    },
  },
  performance: {
    enableCaching: false, // Disabled for hot reload
    cacheTimeout: 300000, // 5 minutes
    enableCompression: false,
  },
  security: {
    corsOrigins: ['http://localhost:5173', 'http://localhost:3000'],
    allowedHosts: ['localhost', '127.0.0.1'],
    enableCSP: false, // Relaxed for development
    rateLimitStrict: false,
  },
}

// Staging settings
export const stagingSettings: AppSettings = {
  app: {
    name: 'Modern Template',
    version: '1.0.0',
    environment: 'staging',
  },
  database: {
    maxConnections: 10,
    queryTimeout: 20000, // 20 seconds
    enableLogging: true,
    retryAttempts: 3,
  },
  auth: {
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    tokenExpiry: 30 * 60 * 1000, // 30 minutes
    requireEmailVerification: true,
  },
  features: {
    registration: true,
    oauth: true,
    emailVerification: true,
    maintenanceMode: false,
    betaFeatures: true, // Test beta in staging
  },
  rateLimit: {
    requests: 500,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
  },
  logging: {
    level: 'info',
    enableRequestLogging: true,
    enableErrorTracking: true,
    maxLogSize: 5 * 1024 * 1024, // 5MB
  },
  email: {
    from: 'staging@yourapp.com',
    replyTo: 'support@yourapp.com',
    templates: {
      welcome: 'Welcome to our app',
      passwordReset: 'Password reset request',
      emailVerification: 'Verify your email address',
    },
  },
  performance: {
    enableCaching: true,
    cacheTimeout: 600000, // 10 minutes
    enableCompression: true,
  },
  security: {
    corsOrigins: ['https://staging.yourapp.com'],
    allowedHosts: ['staging.yourapp.com'],
    enableCSP: true,
    rateLimitStrict: true,
  },
}

// Production settings
export const productionSettings: AppSettings = {
  app: {
    name: 'Modern Template',
    version: '1.0.0',
    environment: 'production',
  },
  database: {
    maxConnections: 20,
    queryTimeout: 30000, // 30 seconds
    enableLogging: false, // Performance optimization
    retryAttempts: 5,
  },
  auth: {
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    requireEmailVerification: true,
  },
  features: {
    registration: true,
    oauth: true,
    emailVerification: true,
    maintenanceMode: false,
    betaFeatures: false, // Disabled in production
  },
  rateLimit: {
    requests: 100,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
  },
  logging: {
    level: 'warn', // Only warnings and errors
    enableRequestLogging: false, // Performance optimization
    enableErrorTracking: true,
    maxLogSize: 10 * 1024 * 1024, // 10MB
  },
  email: {
    from: 'noreply@yourapp.com',
    replyTo: 'support@yourapp.com',
    templates: {
      welcome: 'Welcome to our app',
      passwordReset: 'Password reset request',
      emailVerification: 'Verify your email address',
    },
  },
  performance: {
    enableCaching: true,
    cacheTimeout: 3600000, // 1 hour
    enableCompression: true,
  },
  security: {
    corsOrigins: ['https://yourapp.com', 'https://www.yourapp.com'],
    allowedHosts: ['yourapp.com', 'www.yourapp.com'],
    enableCSP: true,
    rateLimitStrict: true,
  },
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
