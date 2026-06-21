import { Briefcase, Wallet, Users, AlertTriangle, ClipboardList, Clock, TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import type { OwnerDashboard, ProjectManagerDashboard, ProjectManagerAggregateDashboard } from "@/validations/dashboard";

type KPI = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  delta?: number | null;
  deltaLabel?: string;
  deltaInvertedColor?: boolean;
};

function formatPHP(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`;
  return `₱${amount.toFixed(0)}`;
}

function Delta({ value, label, inverted }: { value: number; label?: string; inverted?: boolean }) {
  const isZero = value === 0;
  const isPositive = value > 0;
  const isGood = inverted ? !isPositive : isPositive;
  const color = isZero
    ? "text-zinc-400 dark:text-zinc-500"
    : isGood
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-500 dark:text-red-400";
  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown;
  const sign = isPositive ? "+" : "";
  return (
    <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      <span>{sign}{value} {label ?? "vs last week"}</span>
    </p>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  const Icon = kpi.icon;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {kpi.label}
        </p>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {kpi.value}
      </p>
      {kpi.hint && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{kpi.hint}</p>
      )}
      {kpi.delta != null && (
        <Delta value={kpi.delta} label={kpi.deltaLabel} inverted={kpi.deltaInvertedColor} />
      )}
    </div>
  );
}

export function OwnerKPICards({ data }: { data: OwnerDashboard }) {
  const budgetPercent = data.total_budget > 0
    ? Math.round((data.total_spending / data.total_budget) * 100)
    : 0;

  const kpis: KPI[] = [
    {
      label: "Total Active Projects",
      value: String(data.total_active_projects),
      icon: Briefcase,
      delta: data.total_active_projects_delta,
      deltaLabel: "vs last month",
    },
    {
      label: "Budget vs Actual Spend",
      value: formatPHP(data.total_spending),
      hint: `${budgetPercent}% of ${formatPHP(data.total_budget)}`,
      icon: Wallet,
      delta: data.total_spending_delta_percent,
      deltaLabel: "% burn rate vs last week",
      deltaInvertedColor: true,
    },
    {
      label: "Total Workers Active",
      value: String(data.total_workers_active),
      icon: Users,
      delta: data.total_workers_active_delta,
      deltaLabel: "vs last week",
    },
    {
      label: "Incidents This Week",
      value: String(data.incidents_this_week),
      icon: AlertTriangle,
      delta: data.incidents_this_week_delta,
      deltaLabel: "vs last week",
      deltaInvertedColor: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => <KPICard key={kpi.label} kpi={kpi} />)}
    </div>
  );
}

export function ManagerKPICards({ data }: { data: ProjectManagerDashboard }) {
  const budgetPercent = data.phases.reduce((sum, p) => sum + p.allocated_budget, 0) > 0
    ? Math.round((data.total_material_cost / data.phases.reduce((sum, p) => sum + p.allocated_budget, 0)) * 100)
    : 0;
  const totalBudget = data.phases.reduce((sum, p) => sum + p.allocated_budget, 0);

  const kpis: KPI[] = [
    {
      label: "Logs Submitted",
      value: String(data.logs_submitted),
      icon: ClipboardList,
      delta: data.logs_submitted_delta,
      deltaLabel: "vs last week",
    },
    {
      label: "Budget vs Actual Spend",
      value: formatPHP(data.total_material_cost),
      hint: `${budgetPercent}% of ${formatPHP(totalBudget)}`,
      icon: Wallet,
      delta: data.total_spending_delta_percent,
      deltaLabel: "% burn rate vs last week",
      deltaInvertedColor: true,
    },
    {
      label: "Attendance Rate",
      value: `${data.attendance_rate}h avg`,
      icon: Clock,
      delta: data.attendance_rate_delta,
      deltaLabel: "hrs vs last week",
    },
    {
      label: "Incidents This Week",
      value: String(data.total_incidents),
      icon: AlertTriangle,
      delta: data.incidents_this_week_delta,
      deltaLabel: "vs last week",
      deltaInvertedColor: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => <KPICard key={kpi.label} kpi={kpi} />)}
    </div>
  );
}

export function ManagerAggregateKPICards({ data }: { data: ProjectManagerAggregateDashboard }) {
  const budgetPercent = data.total_budget > 0
    ? Math.round((data.total_spending / data.total_budget) * 100)
    : 0;

  const kpis: KPI[] = [
    {
      label: "Total Logs Submitted",
      value: String(data.total_logs_submitted),
      icon: ClipboardList,
      delta: data.total_logs_submitted_delta,
      deltaLabel: "vs last week",
    },
    {
      label: "Budget vs Actual Spend",
      value: formatPHP(data.total_spending),
      hint: `${budgetPercent}% of ${formatPHP(data.total_budget)}`,
      icon: Wallet,
      delta: data.total_spending_delta_percent,
      deltaLabel: "% burn rate vs last week",
      deltaInvertedColor: true,
    },
    {
      label: "Avg Attendance Rate",
      value: `${data.average_attendance_rate}h avg`,
      icon: Clock,
      delta: data.average_attendance_rate_delta,
      deltaLabel: "hrs vs last week",
    },
    {
      label: "Incidents This Week",
      value: String(data.incidents_this_week),
      icon: AlertTriangle,
      delta: data.incidents_this_week_delta,
      deltaLabel: "vs last week",
      deltaInvertedColor: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => <KPICard key={kpi.label} kpi={kpi} />)}
    </div>
  );
}