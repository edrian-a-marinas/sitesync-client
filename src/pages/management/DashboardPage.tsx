import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useOwnerDashboard, useManagerDashboard, useManagerAggregateDashboard } from '@/hooks/useDashboard'
import { OwnerKPICards, ManagerKPICards, ManagerAggregateKPICards } from './__components/dashboard/KPICards'
import { BudgetVsActualChart, MaterialConsumptionChart } from './__components/dashboard/Charts'
import { ProjectHealthTable } from './__components/dashboard/ProjectHealthTable'
import {
  OwnerFilterBar,
  ProjectScopeToggle,
  DEFAULT_FILTERS,
  filterProjects,
  filterMaterialTrends,
  type DashboardFilters,
  type ScopeSelection,
} from './__components/dashboard/DashboardFilter'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/pages/_components/ui/accordion'
import { Skeleton } from '@/pages/_components/ui/skeleton'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const [scopeSelection, setScopeSelection] = useState<ScopeSelection>("aggregate")
  const [ownerFilters, setOwnerFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)

  const ownerYear = isOwner && ownerFilters.year !== "all" ? ownerFilters.year : undefined
  const { data: ownerData, isLoading: ownerLoading, isError: ownerError } = useOwnerDashboard(isOwner, ownerYear)
  const { data: managerData, isLoading: managerLoading, isError: managerError } = useManagerDashboard(
    !isOwner && typeof scopeSelection === "number" ? scopeSelection : null
  )
  const { data: aggregateData, isLoading: aggregateLoading, isError: aggregateError } = useManagerAggregateDashboard(
    !isOwner && scopeSelection === "aggregate"
  )

  if (!user) return null

  const CURRENT_YEAR = new Date().getFullYear()
  const isOwnerCurrentYear = ownerFilters.year === CURRENT_YEAR

  // --- Derived filtered data for owner ---
  const ownerChartData = ownerData
    ? {
        projects: filterProjects(ownerData.all_projects_budget, ownerFilters),
        trends: filterMaterialTrends(ownerData.material_trends, ownerFilters),
      }
    : null

  // Current year → line chart, last 8 weeks only
  // Past year or "all" → bar chart (aggregate totals per material)
  const ownerTrends = (() => {
    if (!ownerChartData) return []
    if (isOwnerCurrentYear) {
      const last8Weeks = [...new Set(
        ownerChartData.trends
          .map(t => t.week)
          .filter((w): w is string => w !== null)
      )].sort().slice(-8)
      const weekSet = new Set(last8Weeks)
      return ownerChartData.trends.filter(t => weekSet.has(t.week ?? ""))
    }
    return ownerChartData.trends
  })()

  const ownerMaterialScope: ScopeSelection = isOwnerCurrentYear ? "aggregate" : 1
  const ownerMaterialLabel = isOwnerCurrentYear
    ? undefined
    : ownerFilters.year === "all"
      ? "All Time"
      : String(ownerFilters.year)

  const ownerChartSubtitle = isOwnerCurrentYear
    ? undefined
    : ownerFilters.year === "all"
      ? "All-time totals, by material"
      : `Full year — ${ownerFilters.year}, by material`

  const renderOwnerKPIs = () => {
    if (ownerLoading) return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    )
    if (ownerError || !ownerData) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
    return <OwnerKPICards data={ownerData} filteredProjects={ownerChartData?.projects} year={ownerFilters.year} />
  }

  const renderManagerKPIs = () => {
    const isManagerLoading = scopeSelection === "aggregate" ? aggregateLoading : managerLoading
    const isManagerError = scopeSelection === "aggregate" ? aggregateError : managerError

    if (isManagerLoading) return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    )
    if (isManagerError) return <p className="text-sm text-red-600">Failed to load dashboard data.</p>
    if (scopeSelection === "aggregate") {
      if (!aggregateData) return null
      return <ManagerAggregateKPICards data={aggregateData} />
    }
    if (!managerData) return null
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
              // Owner: skeleton while loading, charts when ready
              ownerLoading ? (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-28 mb-4" />
                        <Skeleton className="h-64 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Skeleton className="h-4 w-32 mb-4" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full mb-2" />
                    ))}
                  </div>
                </>
              ) : ownerChartData ? (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <BudgetVsActualChart data={ownerChartData.projects} />
                    <MaterialConsumptionChart
                      data={ownerTrends}
                      scopeSelection={ownerMaterialScope}
                      projectName={ownerMaterialLabel}
                      chartSubtitle={ownerChartSubtitle}
                    />
                  </div>
                  <div className="mt-4">
                    <ProjectHealthTable data={ownerChartData.projects} />
                  </div>
                </>
              ) : null
            ) : (
              // PM: skeleton while loading, charts when ready
              (managerLoading || aggregateLoading) ? (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-28 mb-4" />
                        <Skeleton className="h-64 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                    <Skeleton className="h-4 w-32 mb-4" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full mb-2" />
                    ))}
                  </div>
                </>
              ) : activeData && (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <BudgetVsActualChart
                      data={
                        scopeSelection === "aggregate"
                          ? aggregateData?.all_projects_budget ?? []
                          : managerData
                            ? [{
                                project_id: managerData.project_id,
                                project_name: managerData.project_name,
                                status: "Active",
                                total_budget: managerData.phases.reduce((s, p) => s + p.allocated_budget, 0),
                                actual_spending: managerData.total_material_cost,
                                is_over_budget: managerData.total_material_cost > managerData.phases.reduce((s, p) => s + p.allocated_budget, 0),
                                total_incidents: managerData.total_incidents,
                                total_workers: 0,
                              }]
                            : []
                      }
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
                                status: "Active" as const,
                                total_budget: managerData.phases.reduce((s, p) => s + p.allocated_budget, 0),
                                actual_spending: managerData.total_material_cost,
                                is_over_budget: managerData.total_material_cost > managerData.phases.reduce((s, p) => s + p.allocated_budget, 0),
                                total_incidents: managerData.total_incidents,
                                total_workers: 0,
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