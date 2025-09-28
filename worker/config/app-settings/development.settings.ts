import type { AppSettings } from '../app-settings'

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
