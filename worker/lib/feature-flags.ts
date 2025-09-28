import type { AppConfig } from '../config'
import type { User } from '../schemas/user'

// Feature flag types
export interface FeatureFlag {
  key: string
  enabled: boolean
  description?: string
  rolloutPercentage?: number // 0-100
  userRules?: UserRule[]
  environments?: string[] // Which environments this applies to
}

export interface UserRule {
  type: 'user_id' | 'email' | 'role' | 'email_domain'
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in'
  value: string | string[]
}

// Feature flags manager
export class FeatureFlags {
  private flags: Map<string, FeatureFlag> = new Map()

  constructor(_config: AppConfig, initialFlags: FeatureFlag[] = []) {
    this.loadFlags(initialFlags)
  }

  // Load feature flags
  private loadFlags(flags: FeatureFlag[]): void {
    for (const flag of flags) {
      this.flags.set(flag.key, flag)
    }
  }

  // Check if feature is enabled for a user
  isEnabled(flagKey: string, user?: User): boolean {
    const flag = this.flags.get(flagKey)
    if (!flag) {
      // Feature doesn't exist - default to false
      return false
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false
    }

    // Check environment restrictions
    if (flag.environments && flag.environments.length > 0) {
      const currentEnv = 'development' // Will use actual env when integrated
      if (!flag.environments.includes(currentEnv)) {
        return false
      }
    }

    // Check user-specific rules first (they take precedence)
    if (user && flag.userRules) {
      const userRuleResult = this.evaluateUserRules(flag.userRules, user)
      if (userRuleResult !== null) {
        return userRuleResult
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      return this.shouldRolloutToUser(flagKey, user, flag.rolloutPercentage)
    }

    // Default to flag's enabled state
    return flag.enabled
  }

  // Evaluate user rules
  private evaluateUserRules(rules: UserRule[], user: User): boolean | null {
    for (const rule of rules) {
      if (this.matchesUserRule(rule, user)) {
        return true
      }
    }
    return null // No rules matched
  }

  // Check if user matches a specific rule
  private matchesUserRule(rule: UserRule, user: User): boolean {
    let userValue: string

    switch (rule.type) {
      case 'user_id':
        userValue = user.id
        break
      case 'email':
        userValue = user.email
        break
      case 'role':
        userValue = user.role || ''
        break
      case 'email_domain':
        userValue = user.email.split('@')[1] || ''
        break
      default:
        return false
    }

    return this.matchesValue(userValue, rule.operator, rule.value)
  }

  // Check if value matches rule criteria
  private matchesValue(
    userValue: string,
    operator: UserRule['operator'],
    ruleValue: string | string[]
  ): boolean {
    switch (operator) {
      case 'equals':
        return userValue === ruleValue
      case 'contains':
        return typeof ruleValue === 'string' && userValue.includes(ruleValue)
      case 'starts_with':
        return typeof ruleValue === 'string' && userValue.startsWith(ruleValue)
      case 'ends_with':
        return typeof ruleValue === 'string' && userValue.endsWith(ruleValue)
      case 'in':
        return Array.isArray(ruleValue) && ruleValue.includes(userValue)
      default:
        return false
    }
  }

  // Determine if user should be included in rollout based on percentage
  private shouldRolloutToUser(
    flagKey: string,
    user: User | undefined,
    percentage: number
  ): boolean {
    if (percentage >= 100) return true
    if (percentage <= 0) return false

    // Create deterministic hash based on flag key and user ID (or anonymous identifier)
    const identifier = user?.id || 'anonymous'
    const seed = `${flagKey}:${identifier}`

    // Simple hash function to get consistent percentage
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Convert hash to percentage (0-99)
    const userPercentage = Math.abs(hash) % 100
    return userPercentage < percentage
  }

  // Get all enabled flags for a user
  getEnabledFlags(user?: User): string[] {
    const enabled: string[] = []
    for (const [key] of this.flags) {
      if (this.isEnabled(key, user)) {
        enabled.push(key)
      }
    }
    return enabled
  }

  // Get all flags with their status for a user
  getAllFlags(user?: User): Record<string, boolean> {
    const result: Record<string, boolean> = {}
    for (const [key] of this.flags) {
      result[key] = this.isEnabled(key, user)
    }
    return result
  }

  // Add or update a feature flag
  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag)
  }

  // Remove a feature flag
  removeFlag(key: string): void {
    this.flags.delete(key)
  }

  // Get feature flag details
  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key)
  }

  // List all feature flags
  listFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }
}

// Default feature flags based on config
export function createDefaultFeatureFlags(config: AppConfig): FeatureFlag[] {
  return [
    {
      key: 'registration',
      enabled: config.features.registration,
      description: 'Allow new user registration',
    },
    {
      key: 'oauth',
      enabled: config.features.oauth,
      description: 'Enable OAuth authentication',
    },
    {
      key: 'maintenance_mode',
      enabled: config.features.maintenanceMode,
      description: 'Site-wide maintenance mode',
    },
    // Example advanced flags
    {
      key: 'new_ui',
      enabled: true,
      description: 'Enable new user interface',
      rolloutPercentage: 10, // 10% rollout
      environments: ['staging', 'production'],
    },
    {
      key: 'admin_panel',
      enabled: true,
      description: 'Enable admin panel access',
      userRules: [
        {
          type: 'role',
          operator: 'equals',
          value: 'admin',
        },
      ],
    },
    {
      key: 'beta_features',
      enabled: true,
      description: 'Enable beta features for internal users',
      userRules: [
        {
          type: 'email_domain',
          operator: 'equals',
          value: 'yourcompany.com',
        },
      ],
    },
  ]
}

// Helper to create feature flags instance
export function createFeatureFlags(config: AppConfig): FeatureFlags {
  const defaultFlags = createDefaultFeatureFlags(config)
  return new FeatureFlags(config, defaultFlags)
}

// Middleware helper to add feature flags to context
export function addFeatureFlagsToContext(featureFlags: FeatureFlags) {
  return async (
    c: {
      get: (key: string) => unknown
      set: (key: string, value: unknown) => void
    },
    next: () => Promise<void>
  ) => {
    const user = c.get('user') as User | undefined // May be undefined

    // Add feature flags helper to context
    c.set('featureFlags', {
      isEnabled: (key: string) => featureFlags.isEnabled(key, user),
      getEnabled: () => featureFlags.getEnabledFlags(user),
      getAll: () => featureFlags.getAllFlags(user),
    })

    await next()
  }
}

// Type-safe feature flag keys (add your flags here)
export type FeatureFlagKey =
  | 'registration'
  | 'oauth'
  | 'email_verification'
  | 'maintenance_mode'
  | 'new_ui'
  | 'admin_panel'
  | 'beta_features'

// Helper to check feature flags in services
export function checkFeatureFlag(
  featureFlags: FeatureFlags,
  key: FeatureFlagKey,
  user?: User
): boolean {
  return featureFlags.isEnabled(key, user)
}
