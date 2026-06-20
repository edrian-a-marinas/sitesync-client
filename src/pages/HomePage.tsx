import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import DashboardPage from '@/pages/management/DashboardPage'
//import WorkerPage from '@/pages/worker/WorkerPage'

export default function HomePage() {
  const { user } = useAuthStore()

  if (!user) return null

  if (user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER) {
    return <DashboardPage />
  }

  {/* 
  if (user.role_id === ROLES.SITE_WORKER) {
    return <WorkerPage />
  }
    */}

  return null
}