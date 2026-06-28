import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { Badge } from '@/pages/_components/ui/badge'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { parseAnswer } from './utils'
import type { AIQueryResponse } from '@/types/aiQuery'

interface Props {
  queries: AIQueryResponse[]
  isLoading: boolean
  onClose: () => void
}

export function QueryHistoryPanel({ queries, isLoading, onClose }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Query History</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Last 90 days</p>
        </div>
        <button onClick={onClose} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">✕</button>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
            <AlertCircle className="h-6 w-6" />
            <p className="text-xs">No queries yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {queries.map((q) => {
              const parsed = parseAnswer(q.answer)
              const isRateLimit = parsed?.type === 'rate_limit'
              const isTimeout = parsed?.type === 'timeout'
              const isErr = parsed?.type === 'error'
              const isFailed = q.status === 'Failed'
              return (
                <div key={q.id} className="flex flex-col gap-1 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {q.question}
                    </p>
                    {q.status === 'Pending' && (
                      <Badge variant="outline" className="bg-amber-50 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                        Pending
                      </Badge>
                    )}
                    {isFailed && (
                      <Badge variant="outline" className="bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
                        {isRateLimit ? 'Rate Limited' : isTimeout ? 'Timeout' : 'Failed'}
                      </Badge>
                    )}
                  </div>
                  {parsed?.type === 'ok' && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{parsed.text}</p>
                  )}
                  {isRateLimit && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Rate limited by Groq API.</p>
                  )}
                  {(isTimeout || isErr) && (
                    <p className="text-xs text-red-500">{isTimeout ? 'Request timed out.' : 'Query failed.'}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}