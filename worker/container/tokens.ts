// Service tokens for dependency injection
export const SERVICE_TOKENS = {
  USER_SERVICE: 'userService',
  DATABASE: 'database',
  CONFIG: 'config',
  FEATURE_FLAGS: 'featureFlags',
  // Add more service tokens as needed
  // AUTH_SERVICE: 'authService',
} as const

export type ServiceToken = (typeof SERVICE_TOKENS)[keyof typeof SERVICE_TOKENS]
