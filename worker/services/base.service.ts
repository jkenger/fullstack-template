import type { Env } from 'hono'
import type { Container } from '../container/container'
import type { AppConfig } from '../config'
import type { FeatureFlags } from '../lib/feature-flags'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import {
  getDatabase,
  getConfig,
  getFeatureFlags,
} from '../container/registry'
import type { User } from '../schemas/user'

export abstract class BaseService<T = unknown> {
  protected readonly env?: Env
  protected readonly db: DrizzleD1Database | null // Drizzle database instance
  protected readonly config: AppConfig
  protected readonly featureFlags: FeatureFlags
  protected readonly currentUser?: User
  protected _type!: T

  constructor(container?: Container) {
    const context = container?.getContext()
    this.db = container ? getDatabase(container) : null
    this.config = container ? getConfig(container) : ({} as AppConfig)
    this.featureFlags = container
      ? getFeatureFlags(container)
      : ({} as FeatureFlags)
    this.currentUser = context?.user
  }

  // Helper to get current user (throws if not authenticated)
  protected requireUser(): User {
    if (!this.currentUser) {
      throw new Error('User authentication required')
    }
    return this.currentUser
  }

  // Helper to check if user has specific role
  protected hasRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  // Helper to require specific role
  protected requireRole(role: string): void {
    const user = this.requireUser()
    if (user.role !== role) {
      throw new Error(`Role '${role}' required`)
    }
  }

  // Helper to check feature flags
  protected isFeatureEnabled(key: string): boolean {
    return this.featureFlags.isEnabled(key, this.currentUser)
  }

  // Helper to require feature flag to be enabled
  protected requireFeature(key: string): void {
    if (!this.isFeatureEnabled(key)) {
      throw new Error(`Feature '${key}' is not enabled`)
    }
  }


  // Generic pagination that all services can use
  protected applyPagination<U>(
    items: U[],
    options: { page: number; limit: number }
  ): PaginatedResult<U> {
    const total = items.length
    const pages = Math.ceil(total / options.limit)
    const offset = (options.page - 1) * options.limit
    const data = items.slice(offset, offset + options.limit)

    return {
      data,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages,
      },
    }
  }

  // Generic sorting - can be overridden by specific services
  protected applySorting<U extends Record<string, unknown>>(
    items: U[],
    sortBy: keyof U,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): U[] {
    return items.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  // Generic text search - can be overridden for entity-specific logic
  protected applyTextSearch<U extends Record<string, unknown>>(
    items: U[],
    searchTerm: string,
    searchFields: (keyof U)[]
  ): U[] {
    if (!searchTerm) return items

    const term = searchTerm.toLowerCase()
    return items.filter(item =>
      searchFields.some(field =>
        String(item[field]).toLowerCase().includes(term)
      )
    )
  }
}

export interface ServiceContext {
  env?: Env
  user?: { id: string; role: string }
  request?: Request
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
