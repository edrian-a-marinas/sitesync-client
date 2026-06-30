import { create } from 'zustand'
import type { AuthStore } from '@/types/auth'

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  setAuth: (user) => set({ user, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
