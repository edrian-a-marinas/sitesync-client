import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES, ROUTES } from '@/constants'
import { Sidebar } from '@/pages/_components/Sidebar'
import { TopNav } from '@/pages/_components/TopNav'
import DashboardPage from '@/pages/management/DashboardPage'
import ProjectsPage from '@/pages/management/ProjectsPage'
import ManageUsersPage from '@/pages/management/ManageUsersPage'
import DailyLogsPage from '@/pages/management/DailyLogsPage'
import ReportsPage from '@/pages/management/ReportsPage'
import OwnerAnalyticsPage from '@/pages/management/OwnerAnalyticsPage'
import WorkerPage from '@/pages/worker/WorkerPage'
import { useLocation } from '@tanstack/react-router'
export default function HomePage() {
  const { user, sidebarCollapsed } = useAuthStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  if (!user) return null

  const location = useLocation()
  const path = location.pathname

  const content = () => {
    if (user.role_id === ROLES.SITE_WORKER) {
      return <WorkerPage />
    }
    if (user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER) {
      if (path === ROUTES.PROJECTS) return <ProjectsPage />
      if (path === ROUTES.MANAGE_USERS) return <ManageUsersPage />
      if (path === ROUTES.DAILY_LOGS) return <DailyLogsPage />
      if (path === ROUTES.REPORTS) return <ReportsPage />
      if (path === ROUTES.ANALYTICS) return <OwnerAnalyticsPage />
      return <DashboardPage />
    }
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className={`flex flex-1 flex-col transition-all duration-200 ${sidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-64'}`}>
        <TopNav onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-8" style={{ background: 'hsl(var(--page-bg))', minHeight: '100vh', transition: 'background 0.2s ease' }}>
          {content()}
        </main>
      </div>
    </div>
  )
}