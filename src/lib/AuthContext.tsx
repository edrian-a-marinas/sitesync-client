import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getToken, clearToken } from '@/lib/token'
import queryClient from '@/lib/queryClient'
import { getMe } from '@/services/auth'
import { useAuthStore } from '@/store/auth'

interface AuthContextType {
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ logout: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    clearToken()
    clearAuth()
    queryClient.clear()
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      Promise.resolve().then(() => setIsLoading(false))
      return
    }
    getMe()
      .then((user) => setAuth(user))
      .catch(() => {
        clearToken()
        clearAuth()
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) return null

  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext)
