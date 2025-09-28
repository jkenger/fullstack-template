import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import {
  AppError,
  ValidationError,
  InternalServerError,
  isOperationalError,
} from '../lib/errors'
import { createErrorResponse } from '../lib/response'

export async function errorHandler(err: Error, c: Context): Promise<Response> {
  // Log error with context
  const errorId = crypto.randomUUID()
  const logContext = {
    errorId,
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header('user-agent'),
    timestamp: new Date().toISOString(),
  }

  // Handle different error types
  if (err instanceof AppError) {
    // Custom application errors
    console.error('Application Error:', {
      ...logContext,
      errorCode: err.errorCode,
      statusCode: err.statusCode,
      message: err.message,
      context: err.context,
      stack: err.stack,
    })

    const response = createErrorResponse(err.message, `Error ID: ${errorId}`)

    // Add validation details for validation errors
    if (err instanceof ValidationError && err.validationErrors) {
      const validationResponse = response as typeof response & {
        validationErrors: unknown
      }
      validationResponse.validationErrors = err.validationErrors
    }

    return c.json(
      response,
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502
    )
  }

  if (err instanceof HTTPException) {
    // Hono HTTP exceptions
    console.error('HTTP Exception:', {
      ...logContext,
      statusCode: err.status,
      message: err.message,
    })

    return c.json(
      createErrorResponse(err.message, `Error ID: ${errorId}`),
      err.status
    )
  }

  if (err instanceof ZodError) {
    // Zod validation errors
    console.error('Validation Error:', {
      ...logContext,
      issues: err.issues,
    })

    const validationErrors: Record<string, string[]> = {}
    err.issues.forEach(issue => {
      const path = issue.path.join('.')
      if (!validationErrors[path]) {
        validationErrors[path] = []
      }
      validationErrors[path].push(issue.message)
    })

    const response = createErrorResponse(
      'Validation failed',
      `Error ID: ${errorId}`
    )
    const zodResponse = response as typeof response & {
      validationErrors: Record<string, string[]>
    }
    zodResponse.validationErrors = validationErrors

    return c.json(response, 400)
  }

  // Unknown/Programming errors
  const isOperational = isOperationalError(err)

  if (isOperational) {
    console.error('Operational Error:', {
      ...logContext,
      message: err.message,
      stack: err.stack,
    })
  } else {
    // Programming errors - log more details
    console.error('Programming Error:', {
      ...logContext,
      name: err.name,
      message: err.message,
      stack: err.stack,
      constructor: err.constructor.name,
    })

    // In production, don't expose internal error details
    const isDevelopment = c.env?.NODE_ENV === 'development'
    const errorMessage = isDevelopment ? err.message : 'Internal server error'

    return c.json(
      createErrorResponse(errorMessage, `Error ID: ${errorId}`),
      500
    )
  }

  // Default fallback
  return c.json(
    createErrorResponse('Internal server error', `Error ID: ${errorId}`),
    500
  )
}

// Not found handler
export function notFoundHandler(c: Context): Response {
  const response = createErrorResponse(
    `Route ${c.req.method} ${c.req.path} not found`,
    'Check API documentation for available endpoints'
  )
  return c.json(response, 404)
}

// Request timeout middleware (for long-running requests)
export function timeoutMiddleware(timeoutMs: number = 30000) {
  return async (_c: Context, next: Next) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      await next()
      clearTimeout(timeoutId)
    } catch (error: unknown) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new InternalServerError('Request timeout')
      }
      throw error
    }
  }
}
