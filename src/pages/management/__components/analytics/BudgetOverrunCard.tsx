import type { BudgetOverrunResult } from '@/types/ml'
import { Badge } from '@/pages/_components/ui/badge'
import { formatPHP } from '@/utils/formatPHP'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/pages/_components/ui/accordion'

interface Props {
  results: BudgetOverrunResult[]
}

export default function BudgetOverrunCard({ results }: Props) {
  return (
    <Accordion type="single" collapsible defaultValue="budget-overrun" className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <AccordionItem value="budget-overrun" className="border-0">
        <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:no-underline">
          <div className="flex flex-col items-start gap-0.5">
            <span>Budget Overrun Risk</span>
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Probability of exceeding project budget</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {results.map((r) => (
          <div key={r.project_id} className="flex items-center justify-between px-5 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.project_name}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatPHP(r.total_spent)} / {formatPHP(r.total_budget)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex w-28 flex-col gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      r.overrun_probability >= 0.6
                        ? 'bg-red-500'
                        : r.overrun_probability >= 0.3
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.round(r.overrun_probability * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {Math.round(r.overrun_probability * 100)}% risk
                </span>
              </div>
              {r.is_over_budget && (
                <Badge variant="outline" className="bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Over Budget
                </Badge>
              )}
            </div>
          </div>
        ))}
        </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}