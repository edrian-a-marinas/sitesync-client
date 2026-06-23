import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/routeTree'
import { AuthProvider } from '@/lib/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}