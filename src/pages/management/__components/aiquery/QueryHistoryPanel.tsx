import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { Badge } from '@/pages/_components/ui/badge'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Button } from '@/pages/_components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/pages/_components/ui/alert-dialog'
import { AlertCircle, Trash2 } from 'lucide-react'
import { parseAnswer } from './utils'
import type { AIQueryResponse } from '@/types/aiQuery'
interface Props {
  queries: AIQueryResponse[]
  isLoading: boolean
  onClose: () => void
  onDeleteQuery: (queryId: number) => void
  onDeleteAll: () => void
  isDeletingAll: boolean
}
export function QueryHistoryPanel({ queries, isLoading, onClose, onDeleteQuery, onDeleteAll, isDeletingAll }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Query History</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Last 90 days</p>
        </div>
        <div className="flex items-center gap-2">
          {queries.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isDeletingAll} className="h-7 gap-1 text-xs text-red-500 hover:text-red-600 cursor-pointer disabled:cursor-not-allowed">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all query history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes all your AI queries and answers. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteAll} className="bg-red-600 hover:bg-red-700">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <button onClick={onClose} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">✕</button>
        </div>
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
                <div key={q.id} className="group flex flex-col gap-1 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {q.question}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {q.status === 'Pending' && (
                        <Badge variant="outline" className="bg-amber-50 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </Badge>
                      )}
                      {isFailed && (
                        <Badge variant="outline" className="bg-red-50 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {isRateLimit ? 'Rate Limited' : isTimeout ? 'Timeout' : 'Failed'}
                        </Badge>
                      )}
                      <button
                        onClick={() => onDeleteQuery(q.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity cursor-pointer"
                        aria-label="Delete query"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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