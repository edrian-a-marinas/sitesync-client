import { Bell, Search } from "lucide-react";
import type { Role } from "./types";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-8 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search projects, logs, workers…"
            className="h-9 w-80 rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            JD
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Juan dela Cruz</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{role}</span>
          </div>
          <span className="ml-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            {role === "Owner" ? "Owner" : "PM"}
          </span>
        </div>
      </div>
    </header>
  );
}