import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { loginUser, getMe } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { useAuthContext } from '@/lib/AuthContext'
import { saveToken } from '@/lib/token'
import { ROLES, ROUTES } from '@/constants'
import type { LoginInput } from '@/validations/auth'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const { logout } = useAuthContext()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isAdminRoute = pathname === ROUTES.LOGIN_ADMIN

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: async (data) => {
      saveToken(data.access_token)
      const user = await getMe()

      if (!isAdminRoute && (user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER)) {
        logout()
        throw new Error('ACCESS_DENIED')
      }

      setAuth(user)
      navigate('/')
    },
  })
}

export const useLogout = () => {
  const { logout } = useAuthContext()
  const navigate = useNavigate()

  return () => {
    logout()
    navigate(ROUTES.LOGIN)
  }
}