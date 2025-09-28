import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import {
  requestSizeLimit,
  sanitizeRequest,
  securityHeaders,
} from './middleware/requestValidation'
import {
  createUserRoutes,
  createHealthRoutes,
  createBetterAuthRoutes,
} from './routes/index'
import { authMiddleware } from './middleware/auth'
import { createContainer } from './container/registry'
import type { Environment } from './config'

// Create Hono app with full middleware stack and DI container
export function createServer(env: Environment) {
  // Create DI container with environment
  const container = createContainer(env)

  // Build and return the Hono app
  const app = new Hono()
    // Security and validation middleware (order matters)
    .use('*', securityHeaders())
    .use('*', corsMiddleware)
    .use('*', requestSizeLimit(1024 * 1024)) // 1MB request limit
    .use('*', sanitizeRequest)

    // Public routes (no authentication required)
    .route('/api', createHealthRoutes()) // Health check
    .route('/api/auth', createBetterAuthRoutes(container)) // Authentication

    // Protected routes (authentication required)
    .use('/api/users/*', authMiddleware(container))
    .route('/api/users', createUserRoutes(container)) // User management

    // Error handling (must be last)
    .onError(errorHandler)
    .notFound(notFoundHandler)

  // Log the simplified API structure
  console.log('🚀 RPC-only API Routes:')
  console.log('  💚 Health:     /api/health, /api/test')
  console.log('  🔐 Auth:       /api/auth/* (Better Auth)')
  console.log('  👤 Users:      /api/users/* (Protected)')
  console.log('')
  console.log(
    '✅ Clean RPC-only architecture - maximum type safety, minimal overhead!'
  )

  return app
}

// Export the server app type for RPC inference
export type AppType = ReturnType<typeof createServer>
