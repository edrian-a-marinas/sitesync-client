type Row = {
  project: string;
  phase: string;
  budgetStatus: "On Track" | "At Risk" | "Over Budget";
  logCompletion: number;
  lastActivity: string;
};

const ROWS: Row[] = [
  {
    project: "Bonifacio Tower",
    phase: "Structure",
    budgetStatus: "On Track",
    logCompletion: 96,
    lastActivity: "2h ago",
  },
  {
    project: "Cebu Bridge Expansion",
    phase: "Foundation",
    budgetStatus: "Over Budget",
    logCompletion: 88,
    lastActivity: "5h ago",
  },
  {
    project: "Davao Highway Phase 2",
    phase: "Finishing",
    budgetStatus: "On Track",
    logCompletion: 100,
    lastActivity: "1h ago",
  },
  {
    project: "Iloilo Convention Plaza",
    phase: "Structure",
    budgetStatus: "At Risk",
    logCompletion: 74,
    lastActivity: "1d ago",
  },
  {
    project: "QC Residences Block A",
    phase: "Foundation",
    budgetStatus: "On Track",
    logCompletion: 92,
    lastActivity: "3h ago",
  },
  {
    project: "Subic Pier Rehab",
    phase: "Finishing",
    budgetStatus: "On Track",
    logCompletion: 81,
    lastActivity: "6h ago",
  },
];

function StatusPill({ status }: { status: Row["budgetStatus"] }) {
  const styles =
    status === "On Track"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "At Risk"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " + styles
      }
    >
      {status}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-zinc-100">
        <div className={"h-full rounded-full " + color} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-zinc-600">{value}%</span>
    </div>
  );
}

export function ProjectHealthTable() {   
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Project Health</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Active projects across all sites</p>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View all →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-5 py-2.5">Project</th>
              <th className="px-5 py-2.5">Phase</th>
              <th className="px-5 py-2.5">Budget Status</th>
              <th className="px-5 py-2.5">Log Completion</th>
              <th className="px-5 py-2.5">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.project}
                className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30"
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{row.project}</p>
                </td>
                <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300">{row.phase}</td>
                <td className="px-5 py-3.5">
                  <StatusPill status={row.budgetStatus} />
                </td>
                <td className="px-5 py-3.5">
                  <ProgressBar value={row.logCompletion} />
                </td>
                <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">{row.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}