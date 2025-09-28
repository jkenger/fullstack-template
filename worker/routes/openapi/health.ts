import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import {
  HealthResponseSchema,
  TestResponseSchema,
} from '../../schemas/responses'

const startTime = Date.now()

// OpenAPI documented health and system routes

export function createOpenAPIHealthRoutes() {
  const app = new OpenAPIHono()

  // GET /health route
  const healthRoute = createRoute({
    method: 'get',
    path: '/health',
    summary: 'Health check',
    description: 'Check the health status of the API service',
    tags: ['System'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: HealthResponseSchema,
          },
        },
        description: 'Service is healthy',
      },
    },
  })

  // GET /test route
  const testRoute = createRoute({
    method: 'get',
    path: '/test',
    summary: 'Test endpoint',
    description: 'Test endpoint to verify API functionality',
    tags: ['System'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: TestResponseSchema,
          },
        },
        description: 'Test successful',
      },
    },
  })

  // Register the routes
  app.openapi(healthRoute, c => {
    const uptime = (Date.now() - startTime) / 1000
    return c.json({
      success: true,
      data: {
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        uptime,
      },
    })
  })

  app.openapi(testRoute, c => {
    return c.json({
      success: true,
      data: {
        name: 'Cloudflare',
        message: 'Hono RPC with DI is working!',
        timestamp: new Date().toISOString(),
      },
    })
  })

  return app
}
