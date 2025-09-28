import { Hono } from 'hono'
import { createAuth, type Auth } from '../../lib/auth'
import type { Container } from '../../container/container'
import { getDatabase } from '../../container/registry'
import type { Environment } from '../../config'

// Better Auth route handler for Hono
export function createBetterAuthRoutes(container: Container) {
  const app = new Hono()
  let authInstance: Auth | null = null

  // Initialize auth instance lazily
  const getAuth = async (env: Environment) => {
    if (!authInstance) {
      const db = getDatabase(container)
      authInstance = await createAuth(env, db)
    }
    return authInstance
  }

  // Handle all Better Auth routes
  app.all('*', async c => {
    try {
      const env = container.getContext().env
      const auth = await getAuth(env)
      return await auth.handler(c.req.raw)
    } catch (error) {
      console.error('Better Auth error:', error)
      return c.json({ error: 'Authentication service unavailable' }, 500)
    }
  })

  return app
}
