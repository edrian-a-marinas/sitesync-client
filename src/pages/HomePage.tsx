import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { Sidebar } from '@/pages/_components/Sidebar'
import { TopNav } from '@/pages/_components/TopNav'
import DashboardPage from '@/pages/management/DashboardPage'
import WorkerPage from '@/pages/worker/WorkerPage'
export default function HomePage() {
  const { user, sidebarCollapsed } = useAuthStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
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
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className={`flex flex-1 flex-col transition-all duration-200 md:${sidebarCollapsed ? 'pl-[68px]' : 'pl-64'}`}>
        <TopNav onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-8" style={{ background: 'hsl(var(--page-bg))', minHeight: '100vh', transition: 'background 0.2s ease' }}>
          {content()}
        </main>
      </div>
    </div>
  )
}