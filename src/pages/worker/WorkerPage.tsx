import { useAuthStore } from '@/store/auth'

export default function WorkerPage() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-zinc-900">
          Hello, {user.first_name} {user.last_name}!
        </h1>
        <p className="mt-2 text-zinc-500">Site Worker — Welcome to SiteSync</p>
      </div>
    </div>
  )
}