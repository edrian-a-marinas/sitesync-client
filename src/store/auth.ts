import { create } from 'zustand'
import type { UserResponse } from '@/validations/auth'

interface AuthStore {
  user: UserResponse | null
  isAuthenticated: boolean
  setAuth: (user: UserResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}))