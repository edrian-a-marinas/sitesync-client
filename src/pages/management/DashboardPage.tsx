import { useAuthStore } from '@/store/auth'
import { getRoleLabel } from '@/lib/roles'

export default function DashboardPage() {
  const { user } = useAuthStore()
  if (!user) return null

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Hello, {user.first_name} {user.last_name}!
        </h1>
        <p className="mt-2 text-muted-foreground">{getRoleLabel(user.role_id)} — Welcome to SiteSync</p>
      </div>
    </div>
  )
}