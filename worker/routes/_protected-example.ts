// Example protected routes demonstrating Better Auth integration
// This file shows how to use the auth helpers in practice
// NOTE: This file is temporarily disabled as we replaced TodoService with UserService
// To re-enable, update all references to use appropriate services

/*
import { Hono } from 'hono'
import {
  createProtectedRoutes,
  createOptionalAuthRoutes,
  createAdminRoutes,
  createRoleBasedRoutes,
  withUserContainer,
} from '../lib/auth-helpers'
import { getUserService } from '../container/registry'
import { createSuccessResponse } from '../lib/response'
import type { Container } from '../container/container'

// Factory function that creates example routes with authentication
export function createProtectedExampleRoutes(container: Container) {
  // Implementation commented out - needs to be updated for UserService
  return new Hono()
}
*/

// For now, return empty routes
import { Hono } from 'hono'
// import type { Container } from '../container/container'

export function createProtectedExampleRoutes(/* container: Container */) {
  return new Hono()
}