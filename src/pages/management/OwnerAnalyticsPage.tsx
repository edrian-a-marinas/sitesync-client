import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import {
  useBudgetOverrun,
  useDelayRisk,
  useMaterialForecast,
  useMLStatus,
  useRetrainML,
} from '@/hooks/useML'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/pages/_components/ui/tabs'
import { BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import BudgetOverrunCard from './__components/analytics/BudgetOverrunCard'
import DelayRiskCard from './__components/analytics/DelayRiskCard'
import MaterialForecastCard from './__components/analytics/MaterialForecastCard'
import MLStatusBar from './__components/analytics/MLStatusBar'

const COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes
const STATUS_POLL_INTERVAL = 2000 // poll every 2s while retraining

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
        >
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="mb-2 h-3 w-64" />
          {Array.from({ length: 4 }).map((__, j) => (
            <Skeleton key={j} className="my-2 h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function OwnerAnalyticsPage() {
  const { user } = useAuthStore()
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('ml_retrain_cooldown')
    if (!stored) return null
    const parsed = Number(stored)
    return parsed > Date.now() ? parsed : null
  })
  const [isPollingStatus, setIsPollingStatus] = useState(false)
  const preRetrainTimestampRef = useRef<string | null>(null)

  const { data: status, refetch: refetchStatus } = useMLStatus()
  const {
    data: budgetData,
    isLoading: budgetLoading,
    isError: budgetError,
    refetch: refetchBudget,
  } = useBudgetOverrun()
  const {
    data: delayData,
    isLoading: delayLoading,
    isError: delayError,
    refetch: refetchDelay,
  } = useDelayRisk()
  const {
    data: forecastData,
    isLoading: forecastLoading,
    isError: forecastError,
    refetch: refetchForecast,
  } = useMaterialForecast()
  const { mutate: retrain, isPending: isRetraining } = useRetrainML()

  const isLoading = budgetLoading || delayLoading || forecastLoading
  const isError = budgetError || delayError || forecastError
  const modelsReady = status
    ? status.budget_overrun.ready &&
      status.delay_risk.ready &&
      status.material_forecast.ready
    : false

  // Poll status while retraining — stop when last_trained changes
  useEffect(() => {
    if (!isPollingStatus) return
    const interval = setInterval(async () => {
      const result = await refetchStatus()
      const newTimestamp = result.data?.budget_overrun.last_trained
      if (newTimestamp && newTimestamp !== preRetrainTimestampRef.current) {
        setIsPollingStatus(false)
        // Wait 2 extra seconds before notifying and refreshing predictions
        setTimeout(async () => {
          await Promise.all([
            refetchBudget(),
            refetchDelay(),
            refetchForecast(),
          ])
          toast.success('Models updated — predictions refreshed.')
        }, 2000)
      }
    }, STATUS_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [isPollingStatus])

  const handleRetrain = () => {
    // Snapshot current last_trained before retraining
    preRetrainTimestampRef.current = status?.budget_overrun.last_trained ?? null
    retrain(undefined, {
      onSuccess: () => {
        toast.info('Retraining started. Waiting for models to update...')
        const until = Date.now() + COOLDOWN_MS
        setCooldownUntil(until)
        localStorage.setItem('ml_retrain_cooldown', String(until))
        setIsPollingStatus(true)
      },
      onError: () =>
        toast.error('Failed to trigger retraining. Please try again.'),
    })
  }
  if (user?.role_id !== ROLES.OWNER) return null
  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Analytics{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              — Owner View
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            ML-powered predictive insights across all projects
          </p>
        </div>
      </div>

      <MLStatusBar
        status={status}
        isRetraining={isRetraining}
        onRetrain={handleRetrain}
        cooldownUntil={cooldownUntil}
      />

      {!modelsReady && !isLoading && (
        <Alert>
          <AlertDescription>
            Models are not yet trained. Click "Retrain Models" to generate
            predictions.
          </AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load predictions. Please try again.
          </AlertDescription>
        </Alert>
      )}
      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <Tabs defaultValue="budget">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="budget">Budget Overrun Risk</TabsTrigger>
            <TabsTrigger value="delay">Delay Risk</TabsTrigger>
            <TabsTrigger value="material">Material Cost Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="budget">
            {budgetData && budgetData.results.length > 0 ? (
              <BudgetOverrunCard results={budgetData.results} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
                <BarChart2 className="h-8 w-8" />
                <p className="text-sm">No budget overrun data available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delay">
            {delayData && delayData.results.length > 0 ? (
              <DelayRiskCard results={delayData.results} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
                <BarChart2 className="h-8 w-8" />
                <p className="text-sm">No delay risk data available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="material">
            {forecastData && forecastData.results.length > 0 ? (
              <MaterialForecastCard results={forecastData.results} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
                <BarChart2 className="h-8 w-8" />
                <p className="text-sm">No material forecast data available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
