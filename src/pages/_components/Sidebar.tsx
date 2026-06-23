import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  FileText,
  Users,
  BarChart3,
  Sparkles,
  Settings,
  HardHat,
  CalendarCheck,
} from "lucide-react"
import { LogOut } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useLogout } from "@/hooks/useAuth"
import { getRoleLabel } from "@/lib/roles"
import { ROLES, ROUTES } from "@/constants"

type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  ownerOnly?: boolean
  workerOnly?: boolean
}

const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.HOME },
  { label: "Projects", icon: FolderKanban, path: ROUTES.PROJECTS },
  { label: "Daily Logs", icon: ClipboardList, path: ROUTES.DAILY_LOGS },
  { label: "Reports", icon: FileText, path: ROUTES.REPORTS },
  { label: "Manage Users", icon: Users, path: ROUTES.MANAGE_USERS },
  { label: "Analytics", icon: BarChart3, path: ROUTES.ANALYTICS, ownerOnly: true },
  { label: "AI Assistant", icon: Sparkles, path: ROUTES.AI, ownerOnly: true },
  { label: "Settings", icon: Settings, path: ROUTES.SETTINGS },
  { label: "My Attendance", icon: CalendarCheck, path: ROUTES.ATTENDANCE, workerOnly: true },
]

export function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const { user } = useAuthStore()
  const { sidebarCollapsed: collapsed, toggleSidebar } = useAuthStore()
  const logout = useLogout()
  if (!user) return null
  const isWorker = user.role_id === ROLES.SITE_WORKER
  const isOwner = user.role_id === ROLES.OWNER
  const items = NAV.filter((item) => {
    if (item.ownerOnly && !isOwner) return false
    if (item.workerOnly && !isWorker) return false
    if (!item.workerOnly && isWorker) return false
    return true
  })
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 ${collapsed ? 'md:w-[68px]' : 'md:w-64'} w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
          <HardHat className="h-4 w-4 text-sidebar-primary-foreground" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-white">SiteSync</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
              Site Operations
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Workspace
          </p>
        )}
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white [&.active]:bg-sidebar-accent [&.active]:text-white"
                >
                  <Icon className="h-4 w-4 shrink-0 text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80 group-[.active]:text-sidebar-primary" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">
                {user.first_name} {user.last_name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {getRoleLabel(user.role_id)}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={logout}
              className="ml-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/50 transition hover:bg-sidebar-accent/60 hover:text-white"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/50 shadow-sm transition hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
    </>
  )
}