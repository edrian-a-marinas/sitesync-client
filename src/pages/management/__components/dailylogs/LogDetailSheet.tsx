import type { DailyLogResponse } from '@/types/dailyLog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/pages/_components/ui/sheet'
import { Badge } from '@/pages/_components/ui/badge'
import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { CalendarIcon, CloudIcon, ClipboardList, StickyNote, User } from 'lucide-react'
import SitePhotosSection from './SitePhotosSection'

const WEATHER_BADGE: Record<string, string> = {
  Sunny: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cloudy: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  Rainy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Stormy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface Props {
  log: DailyLogResponse | null
  onOpenChange: (open: boolean) => void
}

export default function LogDetailSheet({ log, onOpenChange }: Props) {
  return (
    <Sheet open={!!log} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
            {log?.log_date ?? '—'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="flex flex-col gap-6">

            {/* Submitted By */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <User className="h-3.5 w-3.5" />
                Submitted By
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {log?.submitted_by_name ?? '—'}
              </p>
            </div>

            {/* Weather */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <CloudIcon className="h-3.5 w-3.5" />
                Weather
              </div>
              {log?.weather_condition ? (
                <Badge
                  className={`w-fit text-xs font-medium ${WEATHER_BADGE[log.weather_condition] ?? 'bg-zinc-100 text-zinc-600'}`}
                  variant="outline"
                >
                  {log.weather_condition}
                </Badge>
              ) : (
                <span className="text-sm text-zinc-400">—</span>
              )}
            </div>

            {/* Work Accomplished */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <ClipboardList className="h-3.5 w-3.5" />
                Work Accomplished
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {log?.work_accomplished ?? '—'}
              </p>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {log?.notes ?? '—'}
              </p>
            </div>
            {/* Site Photos */}
            {log && (
              <SitePhotosSection projectId={log.project_id} logId={log.id} />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}