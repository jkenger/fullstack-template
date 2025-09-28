import { OpenAPIHono } from '@hono/zod-openapi'
import { createOpenAPIUserRoutes } from './users'
import { createOpenAPIHealthRoutes } from './health'
import { createOpenAPIAuthRoutes } from './auth'
import { createOpenAPIDocsRoutes } from './docs'
import { getConfig } from '../../container/registry'
import type { Container } from '../../container/container'

// Main OpenAPI documented routes following feature-based organization

export function createOpenAPIRoutes(container: Container) {
  const app = new OpenAPIHono()
  const config = getConfig(container)

  // Register feature routes following our established pattern
  app.route('/users', createOpenAPIUserRoutes(container))
  app.route('/auth', createOpenAPIAuthRoutes(container))
  app.route('/docs', createOpenAPIDocsRoutes(container))

  // Mount health routes at root level (no prefix)
  const healthRoutes = createOpenAPIHealthRoutes()
  app.route('/', healthRoutes)

  // Middleware to protect OpenAPI endpoints
  app.use('/openapi.json', async (c, next) => {
    const env = container.getContext().env
    const isDev = env.NODE_ENV === 'development'
    const isStaging = env.NODE_ENV === 'staging'

    if (!isDev && !isStaging) {
      return c.json(
        { error: 'API documentation not available in production' },
        404
      )
    }

    await next()
  })

  // OpenAPI specification endpoint using config
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      version: config.api.openapi.version,
      title: config.api.openapi.title,
      description: config.api.openapi.description,
      contact: config.api.openapi.contact,
      license: config.api.openapi.license,
    },
    servers: config.api.openapi.servers,
    tags: config.api.openapi.tags,
  })

  console.log('📚 OpenAPI Routes registered:')
  console.log('  📖 Swagger UI: /api/v1/docs')
  console.log('  📖 ReDoc UI:   /api/v1/docs/redoc')
  console.log('  📄 OpenAPI:    /api/v1/openapi.json')
  console.log('  👤 Users:      /api/v1/users/*')
  console.log('  🔐 Auth:       /api/v1/auth/*')
  console.log('  💚 Health:     /api/v1/health')

  return app
}
