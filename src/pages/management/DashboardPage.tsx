import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { KPICards } from './__components/charts/KPICards'
import { BudgetVsActualChart, MaterialConsumptionChart } from './__components/charts/Charts'
import { ProjectHealthTable } from './__components/charts/ProjectHealthTable'
import { ProjectScopeToggle } from './__components/ProjectScopeToggle'

export default function DashboardPage() {
  const { user } = useAuthStore()
  if (!user) return null

  const isOwner = user.role_id === ROLES.OWNER

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Dashboard <span className="text-zinc-400 dark:text-zinc-500">— {isOwner ? 'Owner' : 'PM'} View</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOwner
              ? 'Organization-wide overview across all active projects'
              : 'Your assigned projects overview'}
          </p>
        </div>

        {!isOwner && <ProjectScopeToggle />}
      </div>

      <KPICards />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BudgetVsActualChart />
        <MaterialConsumptionChart />
      </div>

      <ProjectHealthTable />
    </div>
  )
}