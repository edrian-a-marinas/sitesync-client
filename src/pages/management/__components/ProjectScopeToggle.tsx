import { useProjects } from "@/hooks/useProject";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/pages/_components/ui/select";

export type ScopeSelection = "aggregate" | number;

interface ProjectScopeToggleProps {
  selection: ScopeSelection;
  onSelectionChange: (selection: ScopeSelection) => void;
}

export function ProjectScopeToggle({ selection, onSelectionChange }: ProjectScopeToggleProps) {
  const { data: projects, isLoading, isError } = useProjects();

  const handleChange = (value: string) => {
    const next: ScopeSelection = value === "aggregate" ? "aggregate" : Number(value);
    console.log("[ProjectScopeToggle] selection changed:", next);
    onSelectionChange(next);
  };

  const activeProjects = projects?.filter((p) => p.status === "Active") ?? [];
  const completedProjects = projects?.filter((p) => p.status === "Completed") ?? [];

  return (
    <Select
      value={String(selection)}
      onValueChange={handleChange}
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
            {activeProjects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {completedProjects.length > 0 && (
          <SelectGroup>
            <SelectLabel>Completed</SelectLabel>
            {completedProjects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}