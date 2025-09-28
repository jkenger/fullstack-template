import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().url().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  role: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().optional().default('user'),
})

export const InviteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  image: z.string().url('Invalid image URL').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

export type User = z.infer<typeof UserSchema>
export type InviteUserRequest = z.infer<typeof InviteUserSchema>
export type InviteResponse = z.infer<typeof InviteResponseSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
