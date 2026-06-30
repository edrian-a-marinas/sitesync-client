import { z } from "zod";

const PasswordStr = z.string().min(8).max(72);
const NameStr = z.string().min(1).max(50).regex(/^[A-Za-z\s-]+$/);
const PhoneStr = z.string().min(7).max(20);

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

// --- Used in SettingsPage ---
export const PasswordChangeSchema = z.object({
  current_password: PasswordStr,
  new_password: PasswordStr,
});

// --- Inferred types ---
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;