import { useState } from "react";

type StatusFilter = "Active" | "Completed" | "All";

// TODO: replace with PM's actual assigned projects from API — dummy for now, ordered most-recent first
const PM_PROJECTS = ["Cebu Bridge Expansion", "Iloilo Convention Plaza"];

export function ProjectScopeToggle() {
  const [status, setStatus] = useState<StatusFilter>("Active");
  const [selectedProject, setSelectedProject] = useState<string>(PM_PROJECTS[0]);
  const [scope, setScope] = useState<string>(PM_PROJECTS[0]); // default: Active + most recent project

  const handleStatusChange = (value: StatusFilter) => {
    console.log("[ProjectScopeToggle] status changed:", value);
    setStatus(value);
  };

  const handleProjectSelect = (value: string) => {
    console.log("[ProjectScopeToggle] project selected:", value);
    setSelectedProject(value);
    setScope(value);
  };

  const handleAllProjects = () => {
    console.log("[ProjectScopeToggle] scope changed: All Projects");
    setScope("All Projects");
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex h-8 items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-800/50">
        {(["Active", "Completed", "All"] as StatusFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleStatusChange(option)}
            className={
              "flex h-full items-center rounded-md px-3 text-xs font-medium cursor-pointer transition-colors " +
              (status === option
                ? "bg-primary text-primary-foreground"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100")
            }
          >
            {option}
          </button>
        ))}
      </div>

      <select
        value={selectedProject}
        onChange={(e) => handleProjectSelect(e.target.value)}
        className="h-8 cursor-pointer rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200"
      >
        {PM_PROJECTS.map((project) => (
          <option key={project} value={project}>
            {project}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleAllProjects}
        className={
          "flex h-8 items-center rounded-md border px-3 text-xs font-medium cursor-pointer transition-colors " +
          (scope === "All Projects"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100")
        }
      >
        All Projects
      </button>
    </div>
  );
}