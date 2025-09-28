import type { AppSettings } from '.'

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
