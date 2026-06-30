import type { ProjectBudgetSummary, MaterialWeeklyTrend } from "@/validations/dashboard";

export type DashboardFilters = {
  year: number | "all";
  projectId: number | "all";
};

export const DEFAULT_FILTERS: DashboardFilters = {
  year: new Date().getFullYear(),
  projectId: "all",
};

export type ScopeSelection = "aggregate" | number;

function extractYear(week: string | null): number | null {
  if (!week) return null;
  const y = parseInt(week.split("-")[0], 10);
  return isNaN(y) ? null : y;
}

function deriveYears(trends: MaterialWeeklyTrend[]): number[] {
  const set = new Set<number>();
  for (const t of trends) {
    const y = extractYear(t.week);
    if (y !== null) set.add(y);
  }
  return Array.from(set).sort((a, b) => b - a);
}

export function filterProjects(
  projects: ProjectBudgetSummary[],
  filters: DashboardFilters,
): ProjectBudgetSummary[] {
  if (filters.projectId === "all") return projects.filter((p) => p.status === "Active");
  return projects.filter((p) => p.project_id === filters.projectId);
}

export function filterMaterialTrends(
  trends: MaterialWeeklyTrend[],
  filters: DashboardFilters,
): MaterialWeeklyTrend[] {
  let result = trends;
  if (filters.year !== "all") {
    result = result.filter((t) => extractYear(t.week) === filters.year);
  }
  if (filters.projectId !== "all") {
    result = result.filter((t) => t.project_id === filters.projectId);
  }
  return result;
}

export { extractYear, deriveYears };