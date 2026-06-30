import { Navigate, Outlet } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />
  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" />
  return <Outlet />
}

export function NotFound() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} />
  return <div>404 — Page Not Found</div>
}