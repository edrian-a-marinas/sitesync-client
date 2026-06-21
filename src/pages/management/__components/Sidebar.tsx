import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  FileText,
  Users,
  BarChart3,
  Sparkles,
  Settings,
  HardHat,
} from "lucide-react";
import type { Role } from "./types";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  ownerOnly?: boolean;
};

const NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Projects", icon: FolderKanban },
  { label: "Daily Logs", icon: ClipboardList },
  { label: "Reports", icon: FileText },
  { label: "Manage Users", icon: Users },
  { label: "Analytics", icon: BarChart3, ownerOnly: true },
  { label: "AI Assistant", icon: Sparkles, ownerOnly: true },
  { label: "Settings", icon: Settings },
];

export function Sidebar({ role }: { role: Role }) {
  const items = NAV.filter((i) => !i.ownerOnly || role === "Owner");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
          <HardHat className="h-4.5 w-4.5 text-sidebar-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-white">SiteSync</span>
          <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
            Site Operations
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <a
                  href="#"
                  className={
                    "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors " +
                    (item.active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white")
                  }
                >
                  <Icon
                    className={
                      "h-4 w-4 " +
                      (item.active
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")
                    }
                  />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            JD
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-white">Juan dela Cruz</p>
            <p className="truncate text-xs text-sidebar-foreground/50">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}