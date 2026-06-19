import { z } from "zod";

const PasswordStr = z.string().min(8).max(72);
const NameStr = z.string().min(1).max(50).regex(/^[A-Za-z\s\-]+$/);
const PhoneStr = z.string().min(7).max(20);

export const LoginSchema = z.object({
  email: z.string().email(),
  password: PasswordStr,
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: PasswordStr,
  first_name: NameStr,
  middle_name: NameStr.optional(),
  last_name: NameStr,
  phone_number: PhoneStr.optional(),
  role_id: z.number().int().positive(),
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

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;