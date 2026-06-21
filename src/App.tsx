import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/routeTree'
import { AuthProvider } from '@/lib/AuthContext'
//import { ThemeProvider } from "@ccs"

export default function App() {
  return (
    //  <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    // </ThemeProvider>
  )
}