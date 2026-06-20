import type { UserResponse, TokenResponse, LoginInput, RegisterInput } from "@/app/validations/auth";

export type { LoginInput, RegisterInput, UserResponse, TokenResponse };

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}