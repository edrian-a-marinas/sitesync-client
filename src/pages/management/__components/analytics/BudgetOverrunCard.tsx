import type { BudgetOverrunResult } from '@/types/ml'
import { Badge } from '@/pages/_components/ui/badge'
import { Card, CardContent } from '@/pages/_components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'
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
  Cell,
} from 'recharts'

interface Props {
  results: BudgetOverrunResult[]
}

function getRiskColor(prob: number) {
  if (prob >= 0.6) return '#ef4444'
  if (prob >= 0.3) return '#f59e0b'
  return '#10b981'
}

export default function BudgetOverrunCard({ results }: Props) {
  const chartData = results.map((r) => ({
    name: r.project_name,
    spent: r.total_spent,
    budget: r.total_budget,
    probability: Math.round(r.overrun_probability * 100),
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Chart */}
      <Card>
        <CardContent className="pt-5">
          <p className="mb-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">Spent vs Budget per Project (₱)</p>
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
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#fafafa',
                }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#fafafa' }}
                formatter={(value, name) => [
                  formatPHP(Number(value)),
                  name === 'spent' ? 'Total Spent' : 'Total Budget',
                ]}
              />
              <Bar dataKey="budget" fill="#e4e4e7" radius={[4, 4, 0, 0]} name="budget" />
              <Bar dataKey="spent" radius={[4, 4, 0, 0]} name="spent">
                {results.map((r) => (
                  <Cell key={r.project_id} fill={getRiskColor(r.overrun_probability)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Spent / Budget</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.project_id}>
                    <TableCell className="font-medium">{r.project_name}</TableCell>
                    <TableCell className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatPHP(r.total_spent)} / {formatPHP(r.total_budget)}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex w-28 flex-col gap-1 cursor-default">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.round(r.overrun_probability * 100)}%`,
                                    backgroundColor: getRiskColor(r.overrun_probability),
                                  }}
                                />
                              </div>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {Math.round(r.overrun_probability * 100)}% risk
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Overrun probability: {Math.round(r.overrun_probability * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {r.is_over_budget ? (
                        <Badge variant="outline" className="bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Over Budget
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          On Track
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  )
}