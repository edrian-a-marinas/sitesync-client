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

const budgetData = [
  { project: "Bonifacio Tower", budget: 18, actual: 16.4 },
  { project: "Cebu Bridge", budget: 22, actual: 23.1 },
  { project: "Davao Road", budget: 9, actual: 7.8 },
  { project: "Iloilo Plaza", budget: 14, actual: 12.5 },
  { project: "QC Residences", budget: 12, actual: 11.9 },
  { project: "Subic Pier", budget: 16, actual: 12.5 },
];

const materialData = [
  { week: "W1", cement: 420, steel: 280, aggregate: 510 },
  { week: "W2", cement: 480, steel: 310, aggregate: 540 },
  { week: "W3", cement: 460, steel: 295, aggregate: 600 },
  { week: "W4", cement: 540, steel: 360, aggregate: 580 },
  { week: "W5", cement: 510, steel: 340, aggregate: 620 },
  { week: "W6", cement: 600, steel: 390, aggregate: 660 },
  { week: "W7", cement: 580, steel: 410, aggregate: 690 },
  { week: "W8", cement: 640, steel: 430, aggregate: 720 },
];

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

export function BudgetVsActualChart() {
  return (
    <ChartCard title="Budget vs Actual" subtitle="Per project, in ₱ millions">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={budgetData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis dataKey="project" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#fafafa" }} />
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

export function MaterialConsumptionChart() {
  return (
    <ChartCard title="Material Consumption Trends" subtitle="Last 8 weeks, units consumed">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={materialData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
          <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#52525b", paddingTop: 8 }}
          />
          <Line
            type="monotone"
            dataKey="cement"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Cement"
          />
          <Line
            type="monotone"
            dataKey="steel"
            stroke="#18181b"
            strokeWidth={2}
            dot={false}
            name="Steel"
          />
          <Line
            type="monotone"
            dataKey="aggregate"
            stroke="#a1a1aa"
            strokeWidth={2}
            dot={false}
            name="Aggregate"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}