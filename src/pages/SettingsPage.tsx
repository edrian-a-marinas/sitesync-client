import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import MyInfoCard from '@/pages/_components/settings/MyInfoCard'
import SecurityTab from '@/pages/_components/settings/SecurityTab'
import DangerZoneCard from '@/pages/_components/settings/DangerZoneCard'

export default function SettingsPage() {
  const { user } = useAuthStore()
  if (!user) return null

  const canEditOwnName =
    user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your profile and account security
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canEditOwnName && <MyInfoCard user={user} />}
        <div className="flex flex-col gap-6">
          <SecurityTab />
          <DangerZoneCard />
        </div>
      </div>
    </div>
  )
}
