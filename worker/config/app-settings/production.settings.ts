import type { AppSettings } from '.'

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
