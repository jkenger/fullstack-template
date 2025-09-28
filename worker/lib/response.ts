import { z } from 'zod'

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
  error: z.string().optional(),
  message: z.string().optional(),
})

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
