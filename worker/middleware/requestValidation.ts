import type { Context, Next } from 'hono'
import { ValidationError } from '../lib/errors'

// Request size limit middleware
export function requestSizeLimit(maxSizeBytes: number = 1024 * 1024) {
  // 1MB default
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length')

    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      throw new ValidationError(
        `Request too large. Maximum size: ${maxSizeBytes} bytes`
      )
    }

    await next()
  }
}

// Request sanitization middleware
export async function sanitizeRequest(c: Context, next: Next) {
  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)
  c.res.headers.set('X-Request-ID', requestId)

  // Validate content type for POST/PUT/PATCH requests
  const method = c.req.method
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  if (hasBody) {
    const contentType = c.req.header('content-type')
    if (contentType && !contentType.includes('application/json')) {
      throw new ValidationError('Content-Type must be application/json')
    }
  }

  await next()
}

// Security headers middleware
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next()

    // Add security headers
    c.res.headers.set('X-Content-Type-Options', 'nosniff')
    c.res.headers.set('X-Frame-Options', 'DENY')
    c.res.headers.set('X-XSS-Protection', '1; mode=block')
    c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Remove server information
    c.res.headers.delete('Server')
    c.res.headers.delete('X-Powered-By')
  }
}
