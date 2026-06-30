import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/routeTree'
import { AuthProvider } from '@/lib/AuthContext'
import { Toaster } from '@/pages/_components/ui/sonner'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  )
}
