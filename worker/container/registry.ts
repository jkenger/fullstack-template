import { Container } from './container'
import { SERVICE_TOKENS } from './tokens'
import { UserService } from '../services/user.service'
import { createConfig, type Environment } from '../config'
import { createFeatureFlags } from '../lib/feature-flags'
import { drizzle } from 'drizzle-orm/d1'

// Service registration setup - Hono-compatible
export function createContainer(env: Environment): Container {
  // Create comprehensive app configuration (handles validation internally)
  const config = createConfig(env)

  // Create feature flags from config
  const featureFlags = createFeatureFlags(config)

  // Production validation is handled in createConfig

  const container = new Container(env)

  // Register core services
  container.registerValue(SERVICE_TOKENS.CONFIG, config)
  container.registerValue(SERVICE_TOKENS.FEATURE_FLAGS, featureFlags)

  // Register database - use D1 binding from wrangler.jsonc
  // The binding name is "DB" as defined in wrangler.jsonc
  const database = env.DB ? drizzle(env.DB) : null
  container.registerValue(SERVICE_TOKENS.DATABASE, database)

  // Register business services
  container.register(SERVICE_TOKENS.USER_SERVICE, UserService, {
    singleton: true,
  })

  return container
}

// Type-safe service resolution helpers
export function getUserService(container: Container): UserService {
  return container.resolve<UserService>(SERVICE_TOKENS.USER_SERVICE)
}

export function getDatabase<T>(container: Container): T {
  return container.resolve(SERVICE_TOKENS.DATABASE)
}

export function getConfig(container: Container): import('../config').AppConfig {
  return container.resolve(SERVICE_TOKENS.CONFIG)
}


export function getFeatureFlags(
  container: Container
): import('../lib/feature-flags').FeatureFlags {
  return container.resolve(SERVICE_TOKENS.FEATURE_FLAGS)
}

// Add more typed helpers as services are added
// export function getAuthService(container: Container): AuthService {
//   return container.resolve<AuthService>(SERVICE_TOKENS.AUTH_SERVICE)
// }
