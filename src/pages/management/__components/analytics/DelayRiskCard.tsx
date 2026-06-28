import type { DelayRiskResult } from '@/types/ml'
import { Badge } from '@/pages/_components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/pages/_components/ui/accordion'

interface Props {
  results: DelayRiskResult[]
}

const RISK_BADGE: Record<string, string> = {
  High: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function DelayRiskCard({ results }: Props) {
  return (
    <Accordion type="single" collapsible className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <AccordionItem value="delay-risk" className="border-0">
        <AccordionTrigger className="px-5 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:no-underline">
          <div className="flex flex-col items-start gap-0.5">
            <span>Delay Risk</span>
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Project schedule delay probability</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {results.map((r) => (
          <div key={r.project_id} className="flex items-center justify-between px-5 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.project_name}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Score: {Math.round(r.delay_risk_score * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex w-28 flex-col gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      r.risk_level === 'High'
                        ? 'bg-red-500'
                        : r.risk_level === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.round(r.delay_risk_score * 100)}%` }}
                  />
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${RISK_BADGE[r.risk_level]}`}>
                {r.risk_level}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}