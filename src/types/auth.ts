import type { UserResponse, TokenResponse, LoginInput } from "@/validations/auth";
import type { RegisterInput } from "@/validations/user";

export type { LoginInput, RegisterInput, UserResponse, TokenResponse };

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthStore {
  user: UserResponse | null
  isAuthenticated: boolean
  sidebarCollapsed: boolean
  setAuth: (user: UserResponse) => void
  clearAuth: () => void
  toggleSidebar: () => void
}