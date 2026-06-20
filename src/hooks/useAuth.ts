import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { useAuthContext } from '@/lib/AuthContext'
import { saveToken } from '@/lib/token'
import { ROUTES } from '@/constants'
import type { LoginInput } from '@/validations/auth'

export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginInput) => loginUser(data),
    onSuccess: async (data) => {
      saveToken(data.access_token)
      const { getMe } = await import('@/services/auth')
      const user = await getMe()
      setAuth(user)
      navigate(ROUTES.HOME)
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