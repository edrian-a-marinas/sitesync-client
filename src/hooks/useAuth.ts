import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { loginUser, registerUser, logoutUser } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { useAuthContext } from '@/lib/AuthContext'
import { ROLES, ROUTES } from '@/constants'
import type { LoginInput } from '@/validations/auth'
import type { RegisterInput } from '@/validations/user'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdminRoute = pathname === ROUTES.LOGIN_ADMIN

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: (user) => {
      if (
        !isAdminRoute &&
        (user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER)
      ) {
        logoutUser()
        throw new Error('ACCESS_DENIED')
      }
      setAuth(user)
      navigate({ to: '/' })
    },
  })
}

export const useLogout = () => {
  const { logout } = useAuthContext()
  const navigate = useNavigate()
  return () => {
    localStorage.removeItem('dailyLogs:lastProjectId')
    localStorage.removeItem('reports:lastProjectId')
    logout()
    navigate({ to: ROUTES.LOGIN })
  }
}

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerUser(data),
  })
}
