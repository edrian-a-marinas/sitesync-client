import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants'
import LoginPage from '@/pages/LoginPage'
import HomePage from '@/pages/HomePage'
/*
import RegisterPage from '@/pages/RegisterPage'



      <Route path={ROUTES.REGISTER} element={!isAuthenticated ? <RegisterPage /> : <Navigate to={ROUTES.HOME} />} />


*/

export default function Router() {
  const { isAuthenticated, user } = useAuthStore()

  let root: React.ReactNode
  if (!isAuthenticated || !user) {
    root = <LoginPage />
  } else {
    root = <HomePage />
  }

  return (
    <Routes>
      <Route path="/" element={root} />
      <Route path={ROUTES.LOGIN} element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path={ROUTES.LOGIN_ADMIN} element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path={ROUTES.HOME} element={isAuthenticated ? <HomePage /> : <Navigate to={ROUTES.LOGIN} />} />
      <Route path="*" element={<div>404</div>} />
    </Routes>
  )
}