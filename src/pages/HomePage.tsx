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
import OwnerAiAssistantPage from '@/pages/management/OwnerAiAssistantPage'
import WorkerPage from '@/pages/worker/WorkerPage'
import SettingsPage from '@/pages/SettingsPage'
import { useLocation } from '@tanstack/react-router'
export default function HomePage() {
  const { user, sidebarCollapsed } = useAuthStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const path = location.pathname
  if (!user) return null

  const content = () => {
    if (user.role_id === ROLES.SITE_WORKER) {
      if (path === ROUTES.SETTINGS) return <SettingsPage />
      return <WorkerPage />
    }
    if (path === ROUTES.SETTINGS) return <SettingsPage />
    if (
      user.role_id === ROLES.OWNER ||
      user.role_id === ROLES.PROJECT_MANAGER
    ) {
      if (path === ROUTES.PROJECTS) return <ProjectsPage />
      if (path === ROUTES.MANAGE_USERS) return <ManageUsersPage />
      if (path === ROUTES.DAILY_LOGS) return <DailyLogsPage />
      if (path === ROUTES.REPORTS) return <ReportsPage />
      if (path === ROUTES.ANALYTICS) return <OwnerAnalyticsPage />
      if (path === ROUTES.AI_ASSISTANT) return <OwnerAiAssistantPage />
      if (path === ROUTES.SETTINGS) return <SettingsPage />
      return <DashboardPage />
    }
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-200 ${sidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-64'}`}
      >
        <TopNav onMenuClick={() => setMobileSidebarOpen(true)} />
        <main
          className="flex-1 overflow-auto p-8"
          style={{
            background: 'hsl(var(--page-bg))',
            transition: 'background 0.2s ease',
          }}
        >
          {content()}
        </main>
      </div>
    </div>
  )
}
