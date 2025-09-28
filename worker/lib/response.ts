import { z } from '@hono/zod-openapi'

export const ApiResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Indicates if the request was successful',
      example: true,
    }),
    data: z.any().optional().openapi({
      description: 'Response data payload',
    }),
    error: z.string().optional().openapi({
      description: 'Error message if request failed',
      example: 'User not found',
    }),
    message: z.string().optional().openapi({
      description: 'Optional success or informational message',
      example: 'Profile updated successfully',
    }),
  })
  .openapi('ApiResponse')

export const PaginatedResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Indicates if the request was successful',
      example: true,
    }),
    data: z.array(z.any()).openapi({
      description: 'Array of response data items',
    }),
    pagination: z
      .object({
        page: z.number().openapi({
          description: 'Current page number',
          example: 1,
        }),
        limit: z.number().openapi({
          description: 'Items per page',
          example: 10,
        }),
        total: z.number().openapi({
          description: 'Total number of items',
          example: 25,
        }),
        pages: z.number().openapi({
          description: 'Total number of pages',
          example: 3,
        }),
      })
      .openapi({
        description: 'Pagination metadata',
      }),
    error: z.string().optional().openapi({
      description: 'Error message if request failed',
    }),
    message: z.string().optional().openapi({
      description: 'Optional success or informational message',
    }),
  })
  .openapi('PaginatedResponse')

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  error?: string
  message?: string
}

// Helper functions for consistent response creation
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  message,
})

export const createErrorResponse = (
  error: string,
  message?: string
): ApiResponse => ({
  success: false,
  error,
  message,
})

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message?: string
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination,
  message,
})
