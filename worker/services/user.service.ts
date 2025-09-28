import { BaseService } from './base.service'
import type { Container } from '../container/container'
import type { User, UpdateUserRequest } from '../schemas/user'
import { ConflictError, NotFoundError } from '../lib/errors'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'

export class UserService extends BaseService<User> {
  constructor(container?: Container) {
    super(container)
    console.log('Database available:', !!this.db)
    console.log('Database config:', this.config.database)
  }

  async getMe(): Promise<User> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    // Get current user from auth context
    const currentUser = this.requireUser()

    const dbUser = await this.db
      .select()
      .from(user)
      .where(eq(user.id, currentUser.id))
      .get()

    if (!dbUser) {
      throw new NotFoundError('User')
    }

    // Transform DB types to API types - include all Better Auth fields
    return {
      ...dbUser,
      name: dbUser.name || undefined,
      avatar: dbUser.avatar || undefined,
      image: dbUser.image || undefined,
      bio: dbUser.bio || undefined,
      role: 'user', // Default role for API responses
    }
  }

  async updateMe(data: UpdateUserRequest): Promise<User> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    // Get current user from auth context
    const currentUser = this.requireUser()

    // Business logic validation
    if (data.name && data.name.trim().length === 0) {
      throw new ConflictError('Name cannot be empty')
    }

    const dbUpdatedUser = await this.db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))
      .returning()
      .get()

    if (!dbUpdatedUser) {
      throw new NotFoundError('User')
    }

    // Transform DB types to API types - include all Better Auth fields
    return {
      ...dbUpdatedUser,
      name: dbUpdatedUser.name || undefined,
      avatar: dbUpdatedUser.avatar || undefined,
      image: dbUpdatedUser.image || undefined,
      bio: dbUpdatedUser.bio || undefined,
      role: 'user', // Default role for API responses
    }
  }

  // Invite a user by email (admin functionality)
  async inviteUser(
    email: string,
    role: string = 'user'
  ): Promise<{ success: boolean; message: string }> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    console.log('Role', role)

    // Require admin privileges
    this.requireRole('admin')

    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .get()

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // TODO: Implement email invitation logic
    // This would typically:
    // 1. Generate an invitation token
    // 2. Store it in a separate invitations table
    // 3. Send an email with a signup link containing the token
    // 4. When user clicks link, they can set their password and complete signup

    // For now, return a placeholder response
    return {
      success: true,
      message: `Invitation sent to ${email}`,
    }
  }

  // Get all users (admin functionality)
  async getAllUsers(): Promise<User[]> {
    if (!this.db) {
      throw new Error('Database not available')
    }

    // Require admin privileges
    this.requireRole('admin')

    const dbUsers = await this.db.select().from(user).all()

    return dbUsers.map(dbUser => ({
      ...dbUser,
      name: dbUser.name || undefined,
      avatar: dbUser.avatar || undefined,
      image: dbUser.image || undefined,
      bio: dbUser.bio || undefined,
      role: 'user', // Default role for all users
    }))
  }
}
