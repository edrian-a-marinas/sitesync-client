// DEMO FEATURE: delete this entire file if demo mode is retired
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { loginUser } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { DEMO_CREDENTIALS } from '@/demo/constants'
import type { DemoRole } from '@/demo/constants'

export const useDemoLogin = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (role: DemoRole) => {
      const { email, password } = DEMO_CREDENTIALS[role]
      return loginUser({ email, password })
    },
    onSuccess: (user) => {
      setAuth(user)
      navigate({ to: '/' })
    },
  })
}
