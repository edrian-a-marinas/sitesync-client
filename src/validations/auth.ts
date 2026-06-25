import { z } from "zod";

const PasswordStr = z.string().min(8).max(72);
const NameStr = z.string().min(1).max(50).regex(/^[A-Za-z\s-]+$/);
const PhoneStr = z.string().min(7).max(20);


// --- Used in LoginPage ---
export const LoginSchema = z.object({
  email: z.string().email(),
  password: PasswordStr,
});

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role_id: z.number(),
  is_active: z.boolean(),
});

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});

// --- Used in ManageUsersPage ---
export const UserUpdateSchema = z.object({
  first_name: z.union([NameStr, z.literal('')]).optional(),
  middle_name: z.union([NameStr, z.literal('')]).optional(),
  last_name: z.union([NameStr, z.literal('')]).optional(),
  phone_number: z.union([PhoneStr, z.literal('')]).optional(),
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: PasswordStr,
  first_name: NameStr,
  middle_name: z.union([NameStr, z.literal('')]).optional(),
  last_name: NameStr,
  phone_number: z.union([PhoneStr, z.literal('')]).optional(),
  role_id: z.number().int().positive(),
})


export type LoginInput = z.infer<typeof LoginSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;