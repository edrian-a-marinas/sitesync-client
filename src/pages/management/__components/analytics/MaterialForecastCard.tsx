import type { MaterialForecastResult } from '@/types/ml'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/pages/_components/ui/accordion'
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
    <Accordion type="single" collapsible className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <AccordionItem value="material-forecast" className="border-0">
        <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:no-underline">
          <div className="flex flex-col items-start gap-0.5">
            <span>Material Cost Forecast</span>
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Predicted material spend for next month per project</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
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
      </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}