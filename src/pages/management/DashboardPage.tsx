import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useOwnerDashboard, useManagerDashboard, useManagerAggregateDashboard } from '@/hooks/useDashboard'
import { OwnerKPICards, ManagerKPICards, ManagerAggregateKPICards } from './__components/charts/KPICards'
import { BudgetVsActualChart, MaterialConsumptionChart } from './__components/charts/Charts'
import { ProjectHealthTable } from './__components/charts/ProjectHealthTable'
import { ProjectScopeToggle } from './__components/ProjectScopeToggle'

type PMScope = "single" | "aggregate";

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  // PM state — placeholder project_id until ProjectScopeToggle is wired with real data
  const [pmScope, setPmScope] = useState<PMScope>("single")
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

  const { data: ownerData, isLoading: ownerLoading, isError: ownerError } = useOwnerDashboard()
  const { data: managerData, isLoading: managerLoading, isError: managerError } = useManagerDashboard(
    !isOwner && pmScope === "single" ? selectedProjectId : null
  )
  const { data: aggregateData, isLoading: aggregateLoading, isError: aggregateError } = useManagerAggregateDashboard()

  if (!user) return null

  const renderOwnerKPIs = () => {
    if (ownerLoading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
    if (ownerError || !ownerData) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
    return <OwnerKPICards data={ownerData} />
  }

  const renderManagerKPIs = () => {
    if (pmScope === "aggregate") {
      if (aggregateLoading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
      if (aggregateError || !aggregateData) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
      return <ManagerAggregateKPICards data={aggregateData} />
    }
    if (!selectedProjectId) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a project to view KPIs.</p>
    if (managerLoading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
    if (managerError || !managerData) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
    return <ManagerKPICards data={managerData} />
  }

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
        {!isOwner && (
          <ProjectScopeToggle
            //pmScope={pmScope}
            //selectedProjectId={selectedProjectId}
            //onScopeChange={setPmScope}
            //onProjectChange={setSelectedProjectId}
          />
        )}
      </div>

      {isOwner ? renderOwnerKPIs() : renderManagerKPIs()}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BudgetVsActualChart />
        <MaterialConsumptionChart />
      </div>
      <ProjectHealthTable />
    </div>
  )
}