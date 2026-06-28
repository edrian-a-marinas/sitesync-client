import type { MLStatus } from '@/types/ml'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import { RefreshCw } from 'lucide-react'

interface Props {
  status: MLStatus | undefined
  isRetraining: boolean
  onRetrain: () => void
}

const MODEL_LABELS: Record<keyof MLStatus, string> = {
  budget_overrun: 'Budget Overrun',
  delay_risk: 'Delay Risk',
  material_forecast: 'Material Forecast',
}

export default function MLStatusBar({ status, isRetraining, onRetrain }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Model Status</span>
        {status ? (
          (Object.keys(status) as (keyof MLStatus)[]).map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={
                  status[key].ready
                    ? 'bg-emerald-50 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }
              >
                {status[key].ready ? '✓' : '✗'} {MODEL_LABELS[key]}
              </Badge>
              {status[key].last_trained && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {new Date(status[key].last_trained!).toLocaleDateString('en-PH', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              )}
            </div>
          ))
        ) : (
          <span className="text-xs text-zinc-400">Loading...</span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetrain}
        disabled={isRetraining}
      >
        <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
        {isRetraining ? 'Retraining...' : 'Retrain Models'}
      </Button>
    </div>
  )
}