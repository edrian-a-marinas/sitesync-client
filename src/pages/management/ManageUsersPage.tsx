import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import OwnerRegisterForm from '@/pages/management/__components/owner/RegisterForm'
import PmRegisterForm from '@/pages/management/__components/pm/RegisterForm'

export default function RegisterPage() {
  const { user } = useAuthStore()

  if (!user) return null

  if (user.role_id === ROLES.OWNER) return <OwnerRegisterForm />
  if (user.role_id === ROLES.PROJECT_MANAGER) return <PmRegisterForm />

  return null
}