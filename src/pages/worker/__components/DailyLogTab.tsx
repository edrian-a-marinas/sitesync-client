import { useTodayLog } from '@/hooks/useWorker'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Badge } from '@/pages/_components/ui/badge'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { ClipboardList, Cloud, User, StickyNote } from 'lucide-react'
import SitePhotosSection from '@/pages/management/__components/dailylogs/SitePhotosSection'

interface Props {
  projectId: number
}

const WEATHER_BADGE: Record<string, string> = {
  Sunny: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cloudy: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  Rainy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Stormy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function DailyLogTab({ projectId }: Props) {
  const { data: log, isLoading, isError } = useTodayLog(projectId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load today's log. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-zinc-400 dark:text-zinc-500">
        <ClipboardList className="h-10 w-10" />
        <p className="text-sm">No log has been submitted for today yet.</p>
        <p className="text-xs">
          Check back after your project manager submits the shift log.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Daily Log
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Today's site log — read only.
        </p>
      </div>

      {/* Log details card */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Date + Weather */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {log.log_date}
          </span>
          {log.weather_condition && (
            <Badge
              className={`flex items-center gap-1 text-xs font-medium ${WEATHER_BADGE[log.weather_condition] ?? 'bg-zinc-100 text-zinc-600'}`}
              variant="outline"
            >
              <Cloud className="h-3 w-3" />
              {log.weather_condition}
            </Badge>
          )}
        </div>

        {/* Submitted by */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <User className="h-3.5 w-3.5" />
            Submitted By
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {log.submitted_by_name}
          </p>
        </div>

        {/* Work accomplished */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <ClipboardList className="h-3.5 w-3.5" />
            Work Accomplished
          </div>
          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
            {log.work_accomplished}
          </p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <StickyNote className="h-3.5 w-3.5" />
            Notes
          </div>
          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
            {log.notes?.trim() ? log.notes : '—'}
          </p>
        </div>
      </div>

      {/* Site Photos — reuses full SitePhotosSection with x/10, lightbox, upload */}
      <SitePhotosSection projectId={projectId} logId={log.id} />
    </div>
  )
}
