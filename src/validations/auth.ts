import { z } from 'zod'

const PasswordStr = z.string().min(8).max(72)

// --- Used in LoginPage ---
export const LoginSchema = z.object({
  email: z.string().email(),
  password: PasswordStr,
})

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role_id: z.number(),
  is_active: z.boolean(),
  has_assignments: z.boolean().default(false), // used in AssignUserDialog.tsx
})

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer'),
})

// --- Inferred types ---
export type LoginInput = z.infer<typeof LoginSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type TokenResponse = z.infer<typeof TokenResponseSchema>
