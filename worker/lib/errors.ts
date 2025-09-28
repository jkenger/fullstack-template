// Custom error classes for different types of application errors
export abstract class AppError extends Error {
  abstract readonly statusCode: number
  abstract readonly isOperational: boolean
  abstract readonly errorCode: string
  readonly context?: Record<string, unknown>

  constructor(message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    this.context = context

    // Capture stack trace if available (Node.js specific)
    if (
      'captureStackTrace' in Error &&
      typeof Error.captureStackTrace === 'function'
    ) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// 400 - Bad Request
export class ValidationError extends AppError {
  readonly statusCode = 400
  readonly isOperational = true
  readonly errorCode = 'VALIDATION_ERROR'

  readonly validationErrors?: Record<string, string[]>

  constructor(message: string, validationErrors?: Record<string, string[]>) {
    super(message)
    this.validationErrors = validationErrors
  }
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
  readonly statusCode = 401
  readonly isOperational = true
  readonly errorCode = 'UNAUTHORIZED'

  constructor(message: string = 'Authentication required') {
    super(message)
  }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
  readonly statusCode = 403
  readonly isOperational = true
  readonly errorCode = 'FORBIDDEN'

  constructor(message: string = 'Access forbidden') {
    super(message)
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  readonly statusCode = 404
  readonly isOperational = true
  readonly errorCode = 'NOT_FOUND'

  constructor(resource: string = 'Resource') {
    super(`${resource} not found`)
  }
}

// 409 - Conflict
export class ConflictError extends AppError {
  readonly statusCode = 409
  readonly isOperational = true
  readonly errorCode = 'CONFLICT'

  constructor(message: string) {
    super(message)
  }
}

// 422 - Unprocessable Entity
export class BusinessLogicError extends AppError {
  readonly statusCode = 422
  readonly isOperational = true
  readonly errorCode = 'BUSINESS_LOGIC_ERROR'

  constructor(message: string) {
    super(message)
  }
}

// 429 - Too Many Requests
export class RateLimitError extends AppError {
  readonly statusCode = 429
  readonly isOperational = true
  readonly errorCode = 'RATE_LIMIT_EXCEEDED'

  constructor(message: string = 'Too many requests') {
    super(message)
  }
}

// 500 - Internal Server Error
export class InternalServerError extends AppError {
  readonly statusCode = 500
  readonly isOperational = false
  readonly errorCode = 'INTERNAL_SERVER_ERROR'

  constructor(
    message: string = 'Internal server error',
    context?: Record<string, unknown>
  ) {
    super(message, context)
  }
}

// 502 - Bad Gateway (External service errors)
export class ExternalServiceError extends AppError {
  readonly statusCode = 502
  readonly isOperational = true
  readonly errorCode = 'EXTERNAL_SERVICE_ERROR'

  constructor(service: string, message?: string) {
    super(message || `External service ${service} is unavailable`)
  }
}

// Helper function to determine if error is operational (expected) or programming error
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

// Helper to create appropriate error from common scenarios
export function createError(
  statusCode: number,
  message: string,
  context?: Record<string, unknown>
): AppError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message)
    case 401:
      return new UnauthorizedError(message)
    case 403:
      return new ForbiddenError(message)
    case 404:
      return new NotFoundError(message)
    case 409:
      return new ConflictError(message)
    case 422:
      return new BusinessLogicError(message)
    case 429:
      return new RateLimitError(message)
    case 502:
      return new ExternalServiceError('unknown', message)
    default:
      return new InternalServerError(message, context)
  }
}
