import { z } from '@hono/zod-openapi'
import { UserSchema } from './user'

// User-specific response schemas for OpenAPI documentation

export const UserResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Request success status',
      example: true,
    }),
    data: UserSchema.openapi({
      description: 'User data',
    }),
    message: z.string().optional().openapi({
      description: 'Optional success message',
      example: 'Profile retrieved successfully',
    }),
  })
  .openapi('UserResponse')

export const UpdateUserResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Request success status',
      example: true,
    }),
    data: UserSchema.openapi({
      description: 'Updated user data',
    }),
    message: z.string().openapi({
      description: 'Success message',
      example: 'Profile updated successfully',
    }),
  })
  .openapi('UpdateUserResponse')

export const HealthResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Request success status',
      example: true,
    }),
    data: z.object({
      message: z.string().openapi({
        description: 'Health status message',
        example: 'API is healthy',
      }),
      timestamp: z.string().openapi({
        description: 'Current timestamp',
        example: '2024-01-20T14:45:00.000Z',
      }),
      uptime: z.number().openapi({
        description: 'Server uptime in seconds',
        example: 3600.5,
      }),
    }),
  })
  .openapi('HealthResponse')

export const TestResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Request success status',
      example: true,
    }),
    data: z.object({
      name: z.string().openapi({
        description: 'Platform name',
        example: 'Cloudflare',
      }),
      message: z.string().openapi({
        description: 'Test message',
        example: 'Hono RPC with DI is working!',
      }),
      timestamp: z.string().openapi({
        description: 'Current timestamp',
        example: '2024-01-20T14:45:00.000Z',
      }),
    }),
  })
  .openapi('TestResponse')

export const AuthInfoResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Request success status',
      example: true,
    }),
    data: z.object({
      message: z.string().openapi({
        description: 'Auth system info',
        example: 'Authentication endpoints will be implemented here',
      }),
      available: z.array(z.string()).openapi({
        description: 'Available auth endpoints',
        example: ['login', 'logout', 'register', 'session', 'refresh'],
      }),
    }),
  })
  .openapi('AuthInfoResponse')

// Error response schema
export const ErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({
      description: 'Request failure status',
      example: false,
    }),
    error: z.string().openapi({
      description: 'Error message',
      example: 'User not found',
    }),
    message: z.string().optional().openapi({
      description: 'Additional error details',
      example: 'The requested user does not exist in the system',
    }),
  })
  .openapi('ErrorResponse')
