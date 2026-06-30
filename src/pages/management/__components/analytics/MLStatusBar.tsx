import { useState, useEffect } from 'react'
import type { MLStatus } from '@/types/ml'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/pages/_components/ui/tooltip'
import { RefreshCw } from 'lucide-react'

interface Props {
  status: MLStatus | undefined
  isRetraining: boolean
  onRetrain: () => void
  cooldownUntil: number | null
}

const MODEL_LABELS: Record<keyof MLStatus, string> = {
  budget_overrun: 'Budget Overrun',
  delay_risk: 'Delay Risk',
  material_forecast: 'Material Forecast',
}

export default function MLStatusBar({
  status,
  isRetraining,
  onRetrain,
  cooldownUntil,
}: Props) {
  const [cooldownLeft, setCooldownLeft] = useState(0)

  useEffect(() => {
    if (!cooldownUntil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets cooldown when timer target is cleared
      setCooldownLeft(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((cooldownUntil - Date.now()) / 1000),
      )
      setCooldownLeft(remaining)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  const isCoolingDown = cooldownLeft > 0
  const isDisabled = isRetraining || isCoolingDown

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Model Status
        </span>
        {status ? (
          <>
            {(Object.keys(status) as (keyof MLStatus)[]).map((key) => (
              <Badge
                key={key}
                variant="outline"
                className={
                  status[key].ready
                    ? 'bg-emerald-50 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }
              >
                {status[key].ready ? '✓' : '✗'} {MODEL_LABELS[key]}
              </Badge>
            ))}
            {status.budget_overrun.last_trained && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(
                  status.budget_overrun.last_trained,
                ).toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-zinc-400">Loading...</span>
        )}
      </div>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={isDisabled ? 'cursor-not-allowed' : ''}>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetrain}
                disabled={isDisabled}
                className={isDisabled ? 'pointer-events-none' : ''}
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 ${isRetraining ? 'animate-spin' : ''}`}
                />
                {isCoolingDown
                  ? `Retrain in ${formatCooldown(cooldownLeft)}`
                  : isRetraining
                    ? 'Retraining...'
                    : 'Retrain Models'}
              </Button>
            </span>
          </TooltipTrigger>
          {isDisabled && (
            <TooltipContent>
              {isCoolingDown ? (
                <p>
                  Models were recently retrained. Available again in{' '}
                  {formatCooldown(cooldownLeft)}.
                </p>
              ) : (
                <p>Models are currently retraining. Please wait...</p>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
