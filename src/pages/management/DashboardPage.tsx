import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useOwnerDashboard, useManagerDashboard, useManagerAggregateDashboard } from '@/hooks/useDashboard'
import { OwnerKPICards, ManagerKPICards, ManagerAggregateKPICards } from './__components/charts/KPICards'
import { BudgetVsActualChart, MaterialConsumptionChart } from './__components/charts/Charts'
import { ProjectHealthTable } from './__components/charts/ProjectHealthTable'
import {
  OwnerFilterBar,
  ProjectScopeToggle,
  DEFAULT_FILTERS,
  filterProjects,
  filterMaterialTrends,
  type DashboardFilters,
  type ScopeSelection,
} from './__components/DashboardFilter'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/pages/_components/ui/accordion'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const [scopeSelection, setScopeSelection] = useState<ScopeSelection>("aggregate")
  const [ownerFilters, setOwnerFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)

  const { data: ownerData, isLoading: ownerLoading, isError: ownerError } = useOwnerDashboard(isOwner)
  const { data: managerData, isLoading: managerLoading, isError: managerError } = useManagerDashboard(
    !isOwner && typeof scopeSelection === "number" ? scopeSelection : null
  )
  const { data: aggregateData, isLoading: aggregateLoading, isError: aggregateError } = useManagerAggregateDashboard(
    !isOwner && scopeSelection === "aggregate"
  )

  if (!user) return null

  // --- Derived filtered data for owner ---
  const ownerChartData = ownerData
    ? {
        projects: filterProjects(ownerData.all_projects_budget, ownerFilters),
        trends: filterMaterialTrends(ownerData.material_trends, ownerFilters),
      }
    : null

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

  // Resolve chart data for non-owner
  const activeData = scopeSelection === "aggregate" ? aggregateData : managerData

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Dashboard{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              — {isOwner ? 'Owner' : 'PM'} View
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOwner
              ? 'Organization-wide overview across all active projects'
              : 'Your assigned projects overview'}
          </p>
        </div>

        {/* Owner: filter bar | PM: scope toggle */}
        {isOwner ? (
          ownerData && (
            <OwnerFilterBar
              filters={ownerFilters}
              onFiltersChange={setOwnerFilters}
              materialTrends={ownerData.material_trends}
            />
          )
        ) : (
          <ProjectScopeToggle
            selection={scopeSelection}
            onSelectionChange={setScopeSelection}
          />
        )}
      </div>

      {/* KPI Cards */}
      {isOwner ? renderOwnerKPIs() : renderManagerKPIs()}

      {/* Charts accordion */}
      <Accordion
        type="single"
        collapsible
        defaultValue="charts"
        className="rounded-lg border border-zinc-200 bg-white px-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <AccordionItem value="charts" className="border-0">
          <AccordionTrigger className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:no-underline">
            Charts & Trends
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            {isOwner ? (
              // Owner: use filtered data
              ownerChartData && (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <BudgetVsActualChart data={ownerChartData.projects} />
                    <MaterialConsumptionChart
                      data={ownerChartData.trends}
                      scopeSelection="aggregate"
                    />
                  </div>
                  <div className="mt-4">
                    <ProjectHealthTable data={ownerChartData.projects} />
                  </div>
                </>
              )
            ) : (
              // PM: unchanged
              activeData && (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <BudgetVsActualChart
                      data={(scopeSelection === "aggregate" ? aggregateData : ownerData)?.all_projects_budget ?? []}
                    />
                    <MaterialConsumptionChart
                      data={
                        scopeSelection === "aggregate"
                          ? aggregateData!.material_trends
                          : managerData!.material_trends
                      }
                      scopeSelection={scopeSelection}
                      projectName={
                        typeof scopeSelection === "number"
                          ? managerData?.project_name
                          : undefined
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <ProjectHealthTable
                      data={
                        scopeSelection === "aggregate"
                          ? aggregateData?.all_projects_budget ?? []
                          : managerData
                            ? [{
                                project_id: managerData.project_id,
                                project_name: managerData.project_name,
                                total_budget: managerData.phases.reduce((s, p) => s + p.allocated_budget, 0),
                                actual_spending: managerData.total_material_cost,
                                is_over_budget: managerData.total_material_cost > managerData.phases.reduce((s, p) => s + p.allocated_budget, 0),
                              }]
                            : []
                      }
                    />
                  </div>
                </>
              )
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}