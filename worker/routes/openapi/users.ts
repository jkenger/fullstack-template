import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getUserService } from '../../container/registry'
import { UpdateUserSchema } from '../../schemas/user'
import {
  UserResponseSchema,
  UpdateUserResponseSchema,
  ErrorResponseSchema
} from '../../schemas/responses'
import type { Container } from '../../container/container'

// OpenAPI documented user routes

export function createOpenAPIUserRoutes(container: Container) {
  const app = new OpenAPIHono()

  // GET /users/me route
  const getMeRoute = createRoute({
    method: 'get',
    path: '/me',
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile information',
    tags: ['Users'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: UserResponseSchema,
          },
        },
        description: 'Successfully retrieved user profile',
      },
      401: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
        description: 'Authentication required',
      },
      404: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
        description: 'User not found',
      },
    },
  })

  // PUT /users/me route
  const updateMeRoute = createRoute({
    method: 'put',
    path: '/me',
    summary: 'Update current user profile',
    description: 'Update the authenticated user\'s profile information',
    tags: ['Users'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: UpdateUserSchema,
          },
        },
        description: 'User profile updates',
        required: true,
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: UpdateUserResponseSchema,
          },
        },
        description: 'Successfully updated user profile',
      },
      400: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
        description: 'Invalid request data',
      },
      401: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
        description: 'Authentication required',
      },
      404: {
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
        description: 'User not found',
      },
    },
  })

  // Register the routes
  app.openapi(getMeRoute, async (c) => {
    const userService = getUserService(container)
    const user = await userService.getMe()

    return c.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    }, 200)
  })

  app.openapi(updateMeRoute, async (c) => {
    const data = c.req.valid('json')
    const userService = getUserService(container)
    const user = await userService.updateMe(data)

    return c.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    }, 200)
  })

  return app
}