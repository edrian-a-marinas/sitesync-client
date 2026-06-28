import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useBudgetOverrun, useDelayRisk, useMaterialForecast, useMLStatus, useRetrainML } from '@/hooks/useML'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import BudgetOverrunCard from './__components/analytics/BudgetOverrunCard'
import DelayRiskCard from './__components/analytics/DelayRiskCard'
import MaterialForecastCard from './__components/analytics/MaterialForecastCard'
import MLStatusBar from './__components/analytics/MLStatusBar'

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
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
  if (user?.role_id !== ROLES.OWNER) return null

  const { data: status } = useMLStatus()
  const { data: budgetData, isLoading: budgetLoading, isError: budgetError } = useBudgetOverrun()
  const { data: delayData, isLoading: delayLoading, isError: delayError } = useDelayRisk()
  const { data: forecastData, isLoading: forecastLoading, isError: forecastError } = useMaterialForecast()
  const { mutate: retrain, isPending: isRetraining } = useRetrainML()

  const isLoading = budgetLoading || delayLoading || forecastLoading
  const isError = budgetError || delayError || forecastError

  const modelsReady = status
    ? status.budget_overrun.ready && status.delay_risk.ready && status.material_forecast.ready
    : false

  const handleRetrain = () => {
    retrain(undefined, {
      onSuccess: () => toast.success('Retraining started. Models will update shortly.'),
      onError: () => toast.error('Failed to trigger retraining. Please try again.'),
    })
  }

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Analytics{' '}
            <span className="text-zinc-400 dark:text-zinc-500">— Owner View</span>
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
      />

      {!modelsReady && !isLoading && (
        <Alert>
          <AlertDescription>
            Models are not yet trained. Click "Retrain Models" to generate predictions.
          </AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load predictions. Please try again.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {budgetData && budgetData.results.length > 0 ? (
            <BudgetOverrunCard results={budgetData.results} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
              <BarChart2 className="h-8 w-8" />
              <p className="text-sm">No budget overrun data available.</p>
            </div>
          )}

          {delayData && delayData.results.length > 0 && (
            <DelayRiskCard results={delayData.results} />
          )}

          {forecastData && forecastData.results.length > 0 && (
            <MaterialForecastCard results={forecastData.results} />
          )}
        </>
      )}
    </div>
  )
}