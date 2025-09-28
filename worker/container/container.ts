import type { Environment } from '../config'
import type { User } from '../schemas/user'

export interface ServiceConstructor<T = unknown> {
  new (container?: Container): T
}

export interface ServiceContext {
  env: Environment
  container?: Container
  user?: User
}

export interface ServiceRegistry {
  [key: string]: {
    constructor: ServiceConstructor
    singleton?: boolean
    instance?: unknown
  }
}

export class Container {
  private registry: ServiceRegistry = {}
  private context: ServiceContext

  constructor(env: Environment, user?: User) {
    this.context = { env, container: this, user }
  }

  // Create a new container with user context (for request-scoped services)
  withUser(user: User): Container {
    const newContainer = new Container(this.context.env, user)
    newContainer.registry = this.registry // Share service registry
    return newContainer
  }

  // Set user context in place (modifies the current container)
  setUser(user: User): void {
    this.context.user = user
  }

  // Register a service
  register<T>(
    token: string,
    constructor: ServiceConstructor<T>,
    options: { singleton?: boolean } = {}
  ): void {
    this.registry[token] = {
      constructor,
      singleton: options.singleton ?? true,
    }
  }

  // Register a value (for things like database instances)
  registerValue<T>(token: string, value: T): void {
    this.registry[token] = {
      constructor: (() => value) as unknown as ServiceConstructor<T>,
      singleton: true,
      instance: value,
    }
  }

  // Resolve a service
  resolve<T>(token: string): T {
    const registration = this.registry[token]

    if (!registration) {
      throw new Error(`Service '${token}' not registered`)
    }

    // Return singleton instance if exists (for registerValue)
    if (registration.singleton && registration.instance !== undefined) {
      return registration.instance as T
    }

    // Check if this is a registered value (has instance but no proper constructor)
    if (registration.instance !== undefined) {
      return registration.instance as T
    }

    // Create new instance for regular services
    const instance = new registration.constructor(this)

    // Cache singleton
    if (registration.singleton) {
      registration.instance = instance
    }

    return instance as T
  }

  // Check if service is registered
  has(token: string): boolean {
    return token in this.registry
  }

  // Get context for manual service creation
  getContext(): ServiceContext {
    return this.context
  }
}
