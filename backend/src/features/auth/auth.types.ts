import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Min 3 characters')
    .max(20, 'Max 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export interface SafeUser {
  id: string
  username: string
  email: string
  bio: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}
