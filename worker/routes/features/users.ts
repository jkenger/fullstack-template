import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createSuccessResponse } from '../../lib/response'
import { getUserService } from '../../container/registry'
import { UpdateUserSchema, InviteUserSchema } from '../../schemas/user'
import type { Container } from '../../container/container'
import { requireRole } from '../../middleware/auth'

// User feature routes - all user-related endpoints in one file
// This maintains full Hono type safety while organizing by feature
export function createUserRoutes(container: Container) {
  return (
    new Hono()
      // Auth middleware applied at server level for RPC type safety

      // GET /users/me - Get current user profile
      .get('/me', async c => {
        const userService = getUserService(container)
        const user = await userService.getMe()
        return c.json(createSuccessResponse(user))
      })

      // PUT /users/me - Update current user profile
      .put('/me', zValidator('json', UpdateUserSchema), async c => {
        const data = c.req.valid('json') // Fully type-safe!
        const userService = getUserService(container)
        const user = await userService.updateMe(data)
        return c.json(
          createSuccessResponse(user, 'Profile updated successfully')
        )
      })

      // Admin routes - require admin role
      // GET /users - Get all users (admin only)
      .get('/', requireRole('admin'), async c => {
        const userService = getUserService(container)
        const users = await userService.getAllUsers()
        return c.json(createSuccessResponse(users))
      })

      // POST /users/invite - Invite user by email (admin only)
      .post(
        '/invite',
        requireRole('admin'),
        zValidator('json', InviteUserSchema),
        async c => {
          const data = c.req.valid('json')
          const userService = getUserService(container)
          const result = await userService.inviteUser(data.email, data.role)
          return c.json(createSuccessResponse(result, result.message))
        }
      )
  )
}
