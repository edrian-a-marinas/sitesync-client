import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useOwnerDashboard, useManagerDashboard, useManagerAggregateDashboard } from '@/hooks/useDashboard'
import { OwnerKPICards, ManagerKPICards, ManagerAggregateKPICards } from './__components/charts/KPICards'
import { BudgetVsActualChart, MaterialConsumptionChart } from './__components/charts/Charts'
import { ProjectHealthTable } from './__components/charts/ProjectHealthTable'
import { ProjectScopeToggle, type ScopeSelection } from './__components/ProjectScopeToggle'
export default function DashboardPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER
  const [scopeSelection, setScopeSelection] = useState<ScopeSelection>("aggregate")
  const { data: ownerData, isLoading: ownerLoading, isError: ownerError } = useOwnerDashboard(isOwner)
  const { data: managerData, isLoading: managerLoading, isError: managerError } = useManagerDashboard(
    !isOwner && typeof scopeSelection === "number" ? scopeSelection : null
  )
  const { data: aggregateData, isLoading: aggregateLoading, isError: aggregateError } = useManagerAggregateDashboard(!isOwner && scopeSelection === "aggregate")
  if (!user) return null

  const renderOwnerKPIs = () => {
    if (ownerLoading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
    if (ownerError || !ownerData) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
    return <OwnerKPICards data={ownerData} />
  }

  const renderManagerKPIs = () => {
    if (scopeSelection === "aggregate") {
      if (aggregateLoading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
      if (aggregateError || !aggregateData) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
      return <ManagerAggregateKPICards data={aggregateData} />
    }
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
            selection={scopeSelection}
            onSelectionChange={setScopeSelection}
          />
        )}
      </div>

      {isOwner ? renderOwnerKPIs() : renderManagerKPIs()}
      {(isOwner ? ownerData : scopeSelection === "aggregate" ? aggregateData : null) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BudgetVsActualChart
            data={(isOwner ? ownerData : aggregateData)!.all_projects_budget}
          />
          <MaterialConsumptionChart
            data={(isOwner ? ownerData : aggregateData)!.material_trends}
          />
        </div>
      )}
      <ProjectHealthTable />
    </div>
  )
}