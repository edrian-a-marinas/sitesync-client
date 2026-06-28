import { createRootRoute, createRoute, createRouter, Outlet, Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
import { ROUTES } from '@/constants'
import type { DailyLogsSearch } from '@/types/dailyLog'
import type { ReportsSearch } from '@/types/report'
import type { UsersSearch } from '@/types/user'

// Root route
const rootRoute = createRootRoute({
  component: Outlet,
})

// Auth guard component
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />
  return <Outlet />
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" />
  return <Outlet />
}

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


// Future routes (uncomment when pages are ready)
/*
import RegisterPage from '@/pages/RegisterPage'

const registerRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: ROUTES.REGISTER,
  component: RegisterPage,
})
*/

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
  protectedRoute.addChildren([homeRoute, indexRoute, projectsRoute, manageUsersRoute, dailyLogsRoute, reportsRoute]),
])

function NotFound() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />
  return <div>404 — Page Not Found</div>
}

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFound,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}