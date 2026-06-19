import { create } from "zustand";
import type { AuthState, UserResponse } from "@/app/types/auth";

interface AuthStore extends AuthState {
  setAuth: (user: UserResponse, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}));