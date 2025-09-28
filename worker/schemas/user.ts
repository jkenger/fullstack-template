import { z } from '@hono/zod-openapi'

export const UserSchema = z
  .object({
    id: z.string().openapi({
      description: 'Unique user identifier',
      example: 'user_123456789',
    }),
    name: z.string().optional().openapi({
      description: "User's display name",
      example: 'John Doe',
    }),
    email: z.string().email().openapi({
      description: "User's email address",
      example: 'john.doe@example.com',
    }),
    emailVerified: z.boolean().openapi({
      description: 'Whether the user email has been verified',
      example: true,
    }),
    image: z.string().url().optional().openapi({
      description: "URL to user's profile image (Better Auth standard)",
      example: 'https://avatars.githubusercontent.com/u/1?v=4',
    }),
    avatar: z.string().url().optional().openapi({
      description: "URL to user's avatar image (legacy field)",
      example: 'https://avatars.githubusercontent.com/u/1?v=4',
    }),
    bio: z.string().optional().openapi({
      description: "User's biography or description",
      example: 'Full-stack developer passionate about modern web technologies',
    }),
    role: z.string().optional().openapi({
      description: "User's role in the system",
      example: 'user',
    }),
    createdAt: z.date().openapi({
      description: 'Timestamp when the user was created',
      example: '2024-01-15T10:30:00.000Z',
    }),
    updatedAt: z.date().openapi({
      description: 'Timestamp when the user was last updated',
      example: '2024-01-20T14:45:00.000Z',
    }),
  })
  .openapi('User')

export const InviteUserSchema = z
  .object({
    email: z.string().email('Invalid email address').openapi({
      description: 'Email address to send invitation to',
      example: 'john.doe@example.com',
    }),
    role: z.string().optional().default('user').openapi({
      description: 'Role to assign to the invited user',
      example: 'user',
    }),
  })
  .openapi('InviteUserRequest')

export const InviteResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: 'Whether the invitation was sent successfully',
      example: true,
    }),
    message: z.string().openapi({
      description: 'Response message',
      example: 'Invitation sent to john.doe@example.com',
    }),
  })
  .openapi('InviteResponse')

export const UpdateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .optional()
      .openapi({
        description: 'Updated display name for the user',
        example: 'Jane Smith',
      }),
    bio: z.string().max(500, 'Bio too long').optional().openapi({
      description: 'Updated biography or description',
      example: 'Senior software engineer with 5+ years of experience',
    }),
    image: z.string().url('Invalid image URL').optional().openapi({
      description: 'Updated profile image URL (Better Auth standard)',
      example: 'https://avatars.githubusercontent.com/u/2?v=4',
    }),
    avatar: z.string().url('Invalid avatar URL').optional().openapi({
      description: 'Updated avatar image URL (legacy field)',
      example: 'https://avatars.githubusercontent.com/u/2?v=4',
    }),
  })
  .openapi('UpdateUserRequest')

export type User = z.infer<typeof UserSchema>
export type InviteUserRequest = z.infer<typeof InviteUserSchema>
export type InviteResponse = z.infer<typeof InviteResponseSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
