import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { ProjectBudgetSummary, MaterialWeeklyTrend } from "@/validations/dashboard";
import { formatPHP } from "@/utils/formatPHP";
import type { ScopeSelection } from "@/pages/management/__components/ProjectScopeToggle";

const axisTick = { fill: "#71717a", fontSize: 11 };
const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: 6,
  fontSize: 12,
  color: "#18181b",
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

export function BudgetVsActualChart({ data }: { data: ProjectBudgetSummary[] }) {
  console.log("[BudgetVsActualChart] raw data:", data);
  const chartData = data.map((p) => ({
    project: p.project_name,
    budget: Number((p.total_budget / 1_000_000).toFixed(2)),
    actual: Number((p.actual_spending / 1_000_000).toFixed(2)),
  }));
  console.log("[BudgetVsActualChart] chart data (in millions):", chartData);
  return (
    <ChartCard title="Budget vs Actual (Active)" subtitle="Per project, in ₱ millions">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis dataKey="project" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis 
            tick={axisTick} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value: number) => `₱${value}M`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "#fafafa" }}
            formatter={(value) => formatPHP(Number(value) * 1_000_000, 'short')}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#52525b", paddingTop: 8 }}
          />
          <Bar dataKey="budget" fill="#e4e4e7" name="Budget" radius={[3, 3, 0, 0]} />
          <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const LINE_COLORS = ["#f59e0b", "#18181b", "#a1a1aa", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

export function MaterialConsumptionChart({
  data,
  scopeSelection,
  projectName,
}: {
  data: MaterialWeeklyTrend[];
  scopeSelection: ScopeSelection;
  projectName?: string;
}) {
  console.log("[MaterialConsumptionChart] raw data:", data);
  const isSingleProject = typeof scopeSelection === "number";

  const totalCostByMaterial = new Map<string, number>();
  data.forEach((d) => {
    totalCostByMaterial.set(d.material_name, (totalCostByMaterial.get(d.material_name) ?? 0) + d.total_cost);
  });
  const materialNames = Array.from(totalCostByMaterial.keys()).sort(
    (a, b) => (totalCostByMaterial.get(b) ?? 0) - (totalCostByMaterial.get(a) ?? 0)
  );

  if (isSingleProject) {
    const totalsData = materialNames.map((name) => ({
      material: name,
      total: totalCostByMaterial.get(name) ?? 0,
    }));
    const grandTotal = totalsData.reduce((sum, d) => sum + d.total, 0);
    const grandTotalLiteral = `₱${grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return (
      <ChartCard
        title={`Material Consumption of ${projectName ?? "Project"}`}
        subtitle={`Total costs by material, all-time — ${grandTotalLiteral}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={totalsData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
            <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(value: number) => formatPHP(value, 'short')} />
            <YAxis type="category" dataKey="material" tick={axisTick} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatPHP(Number(value), 'short')}
            />
            <Bar dataKey="total" fill="#f59e0b" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    );
  }

  const weeks = Array.from(new Set(data.map((d) => d.week))).sort();
  const chartData = weeks.map((week) => {
    const row: Record<string, string | number> = { week: week ?? "" };
    materialNames.forEach((name) => {
      const entry = data.find((d) => d.week === week && d.material_name === name);
      row[name] = entry ? entry.total_cost : 0;
    });
    return row;
  });
  console.log("[MaterialConsumptionChart] chart data (wide format):", chartData);
  return (
    <ChartCard title="Material Consumption Trends" subtitle="Last 8 weeks, costs by material">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis 
            tick={axisTick} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value: number) => formatPHP(value, 'short')}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              const sorted = [...payload].sort((a, b) => Number(b.value) - Number(a.value));
              return (
                <div style={tooltipStyle} className="px-3 py-2.5">
                  <p className="mb-2 font-medium">{label}</p>
                  <div className="space-y-1">
                    {sorted.map((entry, i) => (
                      <p key={`${entry.name ?? i}`} style={{ color: entry.color }} className="text-xs leading-relaxed">
                        {entry.name}: {formatPHP(Number(entry.value), 'short')}
                      </p>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#52525b", paddingTop: 8 }}
          />
          {materialNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              name={name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}