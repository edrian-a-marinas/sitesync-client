import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetQuery } from '@/hooks/useAIQuery'
import { Badge } from '@/pages/_components/ui/badge'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Bot, User, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { parseAnswer } from './utils'
import type { AIQueryResponse } from '@/types/aiQuery'

interface Props {
  query: AIQueryResponse
  onRateLimit: (retryAfter: number) => void
}

export function ChatMessage({ query, onRateLimit }: Props) {
  const queryClient = useQueryClient()
  const isPending = query.status === 'Pending'
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (!isPending) return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [isPending])
  /* eslint-disable react-hooks/purity -- intentional: gates polling based on current time vs message age */
  const isRecent =
    Date.now() - new Date(query.created_at).getTime() < 5 * 60 * 1000
  /* eslint-enable react-hooks/purity */
  const shouldPoll = isPending && isRecent
  const { data: liveQuery } = useGetQuery(
    shouldPoll ? query.id : null,
    shouldPoll,
  )
  const display = liveQuery ?? query
  const parsed = parseAnswer(display.answer)
  const CLIENT_TIMEOUT_SECONDS = 30
  /* eslint-disable react-hooks/purity -- intentional: gates polling based on current time vs message age */
  const ageSeconds =
    (Date.now() - new Date(display.created_at).getTime()) / 1000
  /* eslint-enable react-hooks/purity */
  const clientTimedOut =
    display.status === 'Pending' &&
    !display.answer &&
    ageSeconds > CLIENT_TIMEOUT_SECONDS

  // Patch the queries list cache when live data resolves so chat panel updates
  useEffect(() => {
    if (!liveQuery || liveQuery.status === 'Pending') return
    queryClient.setQueryData<{
      pages: AIQueryResponse[][]
      pageParams: unknown[]
    }>(['ai-queries'], (old) => {
      if (!old) return old
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((q) => (q.id === liveQuery.id ? liveQuery : q)),
        ),
      }
    })
  }, [liveQuery?.status, liveQuery?.answer])

  const didJustFail =
    liveQuery?.status === 'Failed' && query.status === 'Pending'

  useEffect(() => {
    if (!didJustFail) return
    if (parsed?.type === 'rate_limit') {
      onRateLimit(parsed.retryAfter)
      toast.error(
        `Groq rate limit reached. Try again in ${parsed.retryAfter}s.`,
      )
    } else if (parsed?.type === 'timeout') {
      toast.error('AI response timed out. Please try again.')
    } else if (parsed?.type === 'error') {
      toast.error('AI query failed. Please try again.')
    }
  }, [didJustFail])

  const renderAnswer = () => {
    if (clientTimedOut) {
      return (
        <p className="text-sm text-red-500">
          This is taking longer than expected. Please try again later.
        </p>
      )
    }
    if (display.status === 'Pending') {
      return (
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-40" />
        </div>
      )
    }
    if (!parsed) return null
    if (parsed.type === 'rate_limit') {
      return (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            Groq rate limit reached. You can try again in {parsed.retryAfter}{' '}
            seconds.
          </p>
        </div>
      )
    }
    if (parsed.type === 'timeout') {
      return (
        <p className="text-sm text-red-500">
          Request timed out. Please try again.
        </p>
      )
    }
    if (parsed.type === 'error') {
      return (
        <p className="text-sm text-red-500">
          Something went wrong. Please try again.
        </p>
      )
    }
    return (
      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
        {parsed.text}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Question */}
      <div className="flex items-start gap-2.5 justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5">
          <p className="text-sm text-white dark:text-zinc-900">
            {display.question}
          </p>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
          <User className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
        </div>
      </div>
      {/* Answer */}
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Bot className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
        </div>
        <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5">
          {renderAnswer()}
          {display.status === 'Pending' && !clientTimedOut && (
            <Badge
              variant="outline"
              className="mt-1.5 bg-amber-50 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              Thinking...
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
