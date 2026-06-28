import type { MaterialForecastResult } from '@/types/ml'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/pages/_components/ui/card'
import { formatPHP } from '@/utils/formatPHP'

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Props {
  results: MaterialForecastResult[]
}

export default function MaterialForecastCard({ results }: Props) {
  return (
    <Card>
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
        <CardTitle className="text-sm font-semibold">Material Cost Forecast</CardTitle>
        <CardDescription>Predicted material spend for next month per project</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {results.map((r) => (
            <div key={r.project_id} className="flex items-center justify-between px-5 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.project_name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Forecast for {MONTH_NAMES[r.forecast_month]}
                </span>
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPHP(r.predicted_cost)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}