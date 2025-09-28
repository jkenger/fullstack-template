import type { Context, Next } from 'hono'
import { UnauthorizedError, ForbiddenError } from '../lib/errors'
import { createAuth } from '../lib/auth'
import type { Container } from '../container/container'
import { getDatabase } from '../container/registry'
import type { Environment } from '../config'
import type { User } from '../schemas/user'

// Auth middleware that validates Better Auth sessions
export function authMiddleware(container: Container) {
  return async (c: Context, next: Next) => {
    try {
      const env = container.getContext().env
      const db = getDatabase(container)

      if (!env || !db) {
        console.warn('Auth middleware: missing env or db')
        throw new UnauthorizedError('Authentication service unavailable')
      }

      const user = await validateSession(c.req.raw, env, db)

      if (!user) {
        throw new UnauthorizedError('Invalid or expired session')
      }

      // Add user to context for downstream middleware/handlers
      c.set('user', user)
      c.set('userId', user.id)

      // Set user context in the current container
      container.setUser(user)

      await next()
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError('Authentication failed')
    }
  }
}

// Optional auth middleware - sets user if present but doesn't require it
export function optionalAuthMiddleware(container: Container) {
  return async (c: Context, next: Next) => {
    try {
      const env = container.getContext().env
      const db = getDatabase(container)

      if (env && db) {
        const user = await validateSession(c.req.raw, env, db)
        if (user) {
          c.set('user', user)
          c.set('userId', user.id)

          // Create a new container with user context for this request
          const userContainer = container.withUser(user)
          c.set('container', userContainer)
        }
      }

      await next()
    } catch (error) {
      // Optional auth - continue even if validation fails
      console.warn('Optional auth validation failed:', error)
      await next()
    }
  }
}

// Role-based access control middleware
export function requireRole(requiredRole: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as User | undefined

    if (!user) {
      throw new UnauthorizedError('Authentication required')
    }

    if (!user.role || user.role !== requiredRole) {
      throw new ForbiddenError(`Role '${requiredRole}' required`)
    }

    await next()
  }
}

// Multiple roles support
export function requireAnyRole(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as User | undefined

    if (!user) {
      throw new UnauthorizedError('Authentication required')
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError(
        `One of these roles required: ${allowedRoles.join(', ')}`
      )
    }

    await next()
  }
}

// Helper to get current user from context
export function getCurrentUser(c: Context): User | undefined {
  return c.get('user') as User | undefined
}

// Helper to require current user (throws if not authenticated)
export function requireCurrentUser(c: Context): User {
  const user = getCurrentUser(c)
  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }
  return user
}

// Better Auth session validation using proper API
async function validateSession(
  request: Request,
  env: Environment,
  db: unknown
): Promise<User | null> {
  try {
    const auth = await createAuth(env, db)
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (session?.user) {
      // Convert Better Auth user to our User schema type
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
        emailVerified: session.user.emailVerified || false,
        image: session.user.image || undefined,
        createdAt: new Date(session.user.createdAt),
        updatedAt: new Date(session.user.updatedAt),
      } satisfies User
    }

    return null
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}
