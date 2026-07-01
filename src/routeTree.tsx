import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import { ROUTES } from '@/constants'
import type { DailyLogsSearch } from '@/types/dailyLog'
import type { ReportsSearch } from '@/types/report'
import type { UsersSearch } from '@/types/user'
import {
  ProtectedRoute,
  PublicRoute,
  NotFound,
} from '@/pages/_components/RouteGuards'

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
})
// Public routes
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: PublicRoute,
})

const loginRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: ROUTES.LOGIN,
  component: LoginPage,
})

const loginAdminRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: ROUTES.LOGIN_ADMIN,
  component: LoginPage,
})

// Protected routes
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedRoute,
})

const homeRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.HOME,
  component: HomePage,
})
const projectsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.PROJECTS,
  component: HomePage,
})

const manageUsersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.MANAGE_USERS,
  component: HomePage,
  validateSearch: (search: Record<string, unknown>): UsersSearch => ({
    page: search.page ? Number(search.page) : 1,
    search: typeof search.search === 'string' ? search.search : '',
  }),
})

const dailyLogsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.DAILY_LOGS,
  component: HomePage,
  validateSearch: (search: Record<string, unknown>): DailyLogsSearch => ({
    project: search.project ? Number(search.project) : undefined,
    page: search.page ? Number(search.page) : 1,
    search: typeof search.search === 'string' ? search.search : '',
  }),
})

const aiAssistantRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.AI_ASSISTANT,
  component: HomePage,
})
const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.SETTINGS,
  component: HomePage,
})

const workerAttendanceRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ATTENDANCE,
  component: HomePage,
})

const workerDailyLogRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.WORKER_DAILY_LOG,
  component: HomePage,
})

const analyticsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.ANALYTICS,
  component: HomePage,
})

const reportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.REPORTS,
  component: HomePage,
  validateSearch: (search: Record<string, unknown>): ReportsSearch => ({
    project: search.project ? Number(search.project) : undefined,
    page: search.page ? Number(search.page) : 1,
  }),
})

const indexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: HomePage,
})

// Route tree
const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([loginRoute, loginAdminRoute]),
  protectedRoute.addChildren([
    homeRoute,
    indexRoute,
    projectsRoute,
    manageUsersRoute,
    dailyLogsRoute,
    reportsRoute,
    analyticsRoute,
    aiAssistantRoute,
    settingsRoute,
    workerAttendanceRoute,
    workerDailyLogRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
