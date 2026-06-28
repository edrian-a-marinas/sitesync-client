import type { MaterialForecastResult } from '@/types/ml'
import { Card, CardContent } from '@/pages/_components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/pages/_components/ui/table'
import { formatPHP } from '@/utils/formatPHP'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  results: MaterialForecastResult[]
}

export default function MaterialForecastCard({ results }: Props) {
  const chartData = results.map((r) => ({
    name: r.project_name,
    predicted_cost: r.predicted_cost,
    month: MONTH_NAMES[r.forecast_month],
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Chart */}
      <Card>
        <CardContent className="pt-5">
          <p className="mb-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Predicted Material Cost per Project — {MONTH_NAMES[results[0]?.forecast_month] ?? ''}
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 0, right: 16, left: 8, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-40}
                textAnchor="end"
                interval={0}
                tickFormatter={(v: string) => v.split(' ').slice(0, 2).join(' ')}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                formatter={(value) => [formatPHP(Number(value)), 'Predicted Cost']}
              />
              <Bar dataKey="predicted_cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Forecast Month</TableHead>
                <TableHead>Predicted Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.project_id}>
                  <TableCell className="font-medium">{r.project_name}</TableCell>
                  <TableCell className="text-xs text-zinc-500 dark:text-zinc-400">
                    {MONTH_NAMES[r.forecast_month]}
                  </TableCell>
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatPHP(r.predicted_cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}