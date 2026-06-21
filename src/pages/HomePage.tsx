import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { Sidebar } from '@/pages/_components/Sidebar'
import { TopNav } from '@/pages/_components/TopNav'
import DashboardPage from '@/pages/management/DashboardPage'
import WorkerPage from '@/pages/worker/WorkerPage'

export default function HomePage() {
  const { user } = useAuthStore()

  if (!user) return null

  const content = () => {
    if (user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER) {
      return <DashboardPage />
    }
    if (user.role_id === ROLES.SITE_WORKER) {
      return <WorkerPage />
    }
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <TopNav />
        <main className="flex-1 p-8">
          {content()}
        </main>
      </div>
    </div>
  )
}