import { useProjects } from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/pages/_components/ui/select";
import type { MaterialWeeklyTrend } from "@/validations/dashboard";
import { deriveYears } from "./utils";
import type { DashboardFilters, ScopeSelection } from "./utils";

// ─── Owner: year + project (Active / Completed groups) ───────────────────────

interface OwnerFilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  materialTrends: MaterialWeeklyTrend[];
}

export function OwnerFilterBar({ filters, onFiltersChange, materialTrends }: OwnerFilterBarProps) {
  const { data: projects, isLoading, isError } = useProjects();
  const years = deriveYears(materialTrends);

  const activeProjects = projects?.filter((p) => p.status === "Active") ?? [];
  const completedProjects = projects?.filter((p) => p.status === "Completed") ?? [];

  const isYearActive = filters.projectId === "all";
  const isProjectActive = true;

  const handleYearChange = (v: string) => {
    const year = v === "all" ? "all" : parseInt(v, 10);
    onFiltersChange({ year, projectId: year !== "all" ? "all" : filters.projectId });
  };

  const handleProjectChange = (v: string) => {
    const projectId = v === "all" ? "all" : parseInt(v, 10);
    onFiltersChange({ projectId, year: projectId !== "all" ? "all" : filters.year });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Year */}
      <Select
        value={String(filters.year)}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className={cn(
          "h-8 w-[130px] text-xs transition-colors",
          isYearActive && "border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
        )}>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.length > 0 && (
            <SelectGroup>
              <SelectLabel>Year</SelectLabel>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {/* Project */}
      <Select
        value={String(filters.projectId)}
        disabled={isLoading || isError}
        onValueChange={handleProjectChange}
      >
        <SelectTrigger className={cn(
          "h-8 w-[200px] text-xs transition-colors",
          isProjectActive && "border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
        )}>
          <SelectValue placeholder={isLoading ? "Loading..." : isError ? "Failed" : "All Projects"} />
        </SelectTrigger>
        <SelectContent className="max-h-[280px]">
          <SelectItem value="all">All Projects</SelectItem>
          {activeProjects.length > 0 && (
            <SelectGroup>
              <SelectLabel>Active</SelectLabel>
              {activeProjects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {completedProjects.length > 0 && (
            <SelectGroup>
              <SelectLabel>Completed</SelectLabel>
              {completedProjects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── PM: scope toggle (aggregate or single project) ──────────────────────────
interface ProjectScopeToggleProps {
  selection: ScopeSelection;
  onSelectionChange: (selection: ScopeSelection) => void;
}

export function ProjectScopeToggle({ selection, onSelectionChange }: ProjectScopeToggleProps) {
  const { data: projects, isLoading, isError } = useProjects();

  const activeProjects = projects?.filter((p) => p.status === "Active") ?? [];
  const completedProjects = projects?.filter((p) => p.status === "Completed") ?? [];

  return (
    <Select
      value={String(selection)}
      onValueChange={(v) => onSelectionChange(v === "aggregate" ? "aggregate" : Number(v))}
      disabled={isLoading || isError}
    >
      <SelectTrigger className="h-8 w-[220px] text-xs">
        <SelectValue placeholder={isLoading ? "Loading..." : isError ? "Failed to load" : "Select scope"} />
      </SelectTrigger>
      <SelectContent className="max-h-[280px]">
        <SelectItem value="aggregate">All Active Projects</SelectItem>
        {activeProjects.length > 0 && (
          <SelectGroup>
            <SelectLabel>Active</SelectLabel>
            {activeProjects.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {completedProjects.length > 0 && (
          <SelectGroup>
            <SelectLabel>Completed</SelectLabel>
            {completedProjects.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}