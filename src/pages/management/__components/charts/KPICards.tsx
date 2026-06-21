import { Briefcase, Wallet, Users, AlertTriangle, type LucideIcon } from "lucide-react";

type KPI = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  hint?: string;
};

const KPIS: KPI[] = [
  {
    label: "Total Active Projects",
    value: "12",
    delta: "+2 this month",
    trend: "up",
    icon: Briefcase,
  },
  {
    label: "Budget vs Actual Spend",
    value: "₱84.2M",
    delta: "92% of ₱91.5M",
    trend: "neutral",
    icon: Wallet,
    hint: "Across all active projects",
  },
  {
    label: "Total Workers Active",
    value: "348",
    delta: "+12 vs yesterday",
    trend: "up",
    icon: Users,
  },
  {
    label: "Incidents This Week",
    value: "3",
    delta: "-2 vs last week",
    trend: "down",
    icon: AlertTriangle,
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((kpi) => {
        const Icon = kpi.icon;
        const trendColor =
          kpi.trend === "up"
            ? "text-emerald-600"
            : kpi.trend === "down"
              ? "text-emerald-600"
              : "text-zinc-500";
        return (
          <div
            key={kpi.label}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {kpi.label}
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{kpi.value}</p>
            <p className={"mt-1 text-xs font-medium " + trendColor}>{kpi.delta}</p>
            {kpi.hint ? <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">{kpi.hint}</p> : null}
          </div>
        );
      })}
    </div>
  );
}