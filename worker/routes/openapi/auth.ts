import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { AuthInfoResponseSchema } from '../../schemas/responses'
import type { Container } from '../../container/container'

// OpenAPI documented authentication routes

export function createOpenAPIAuthRoutes(_container: Container) {
  const app = new OpenAPIHono()

  // GET /auth/info route
  const infoRoute = createRoute({
    method: 'get',
    path: '/info',
    summary: 'Authentication system info',
    description: 'Get information about available authentication endpoints',
    tags: ['Authentication'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: AuthInfoResponseSchema,
          },
        },
        description: 'Authentication system information',
      },
    },
  })

  // Register the route
  app.openapi(infoRoute, (c) => {
    return c.json({
      success: true,
      data: {
        message: 'Authentication endpoints will be implemented here',
        available: ['login', 'logout', 'register', 'session', 'refresh'],
      }
    })
  })

  // TODO: Add actual authentication routes when implemented
  // Example routes that could be added:
  /*
  const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    summary: 'User login',
    description: 'Authenticate user with email and password',
    tags: ['Authentication'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: LoginResponseSchema,
          },
        },
        description: 'Login successful',
      },
      401: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
        description: 'Invalid credentials',
      },
    },
  })
  */

  return app
}