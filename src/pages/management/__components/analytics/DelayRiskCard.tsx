import type { DelayRiskResult } from '@/types/ml'
import { Badge } from '@/pages/_components/ui/badge'
import { Card, CardContent } from '@/pages/_components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/pages/_components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/pages/_components/ui/table'
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
  results: DelayRiskResult[]
}

const RISK_COLOR: Record<string, string> = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
}

const RISK_BADGE: Record<string, string> = {
  High: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function DelayRiskCard({ results }: Props) {
  const chartData = results.map((r) => ({
    name: r.project_name,
    score: Math.round(r.delay_risk_score * 100),
    risk_level: r.risk_level,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Chart */}
      <Card>
        <CardContent className="pt-5">
          <p className="mb-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Delay Risk Score per Project (%)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 16, left: 8, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-40}
                textAnchor="end"
                interval={0}
                tickFormatter={(v: string) =>
                  v.split(' ').slice(0, 2).join(' ')
                }
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
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
                formatter={(value) => [`${Number(value)}%`, 'Delay Risk Score']}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {results.map((r) => (
                  <Cell key={r.project_id} fill={RISK_COLOR[r.risk_level]} />
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
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.project_id}>
                    <TableCell className="font-medium">
                      {r.project_name}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex w-28 flex-col gap-1 cursor-default">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.round(r.delay_risk_score * 100)}%`,
                                  backgroundColor: RISK_COLOR[r.risk_level],
                                }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {Math.round(r.delay_risk_score * 100)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Delay risk score:{' '}
                            {Math.round(r.delay_risk_score * 100)}%
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${RISK_BADGE[r.risk_level]}`}
                      >
                        {r.risk_level}
                      </Badge>
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
