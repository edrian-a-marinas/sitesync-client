import { useRef, useEffect, useMemo } from 'react'
import { Button } from '@/pages/_components/ui/button'
import { Textarea } from '@/pages/_components/ui/textarea'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/_components/ui/select'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'
import { Bot, Send, History, ChevronUp, FolderKanban, Loader2 } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { SUGGESTED_QUESTIONS, formatCooldown } from './utils'
import type { AIQueryResponse } from '@/types/aiQuery'
import type { ScopeMarker } from './utils'
import type { ProjectResponse } from '@/validations/project'

interface Props {
  queries: AIQueryResponse[]
  isLoading: boolean
  isError: boolean
  projects: ProjectResponse[]
  question: string
  selectedProjectId: number | null
  isDisabled: boolean
  isRateLimited: boolean
  cooldownLeft: number
  isSubmitting: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  historyOpen: boolean
  scopeMarkers: ScopeMarker[]
  isWaitingForResponse: boolean
  onQuestionChange: (value: string) => void
  onProjectChange: (value: number | null) => void
  onSubmit: (text?: string) => void
  onRateLimit: (retryAfter: number) => void
  onLoadMore: () => void
  onToggleHistory: () => void
}

export function ChatPanel({
  queries,
  isLoading,
  isError,
  projects,
  question,
  selectedProjectId,
  isDisabled,
  isRateLimited,
  cooldownLeft,
  hasNextPage,
  isFetchingNextPage,
  historyOpen,
  scopeMarkers,
  isWaitingForResponse,
  onQuestionChange,
  onProjectChange,
  onSubmit,
  onRateLimit,
  onLoadMore,
  onToggleHistory,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevScrollHeightRef = useRef(0)
  const prevQueriesLengthRef = useRef(0)
  type TimelineItem =
    | { type: 'query'; key: string; timestamp: number; query: AIQueryResponse }
    | { type: 'marker'; key: string; timestamp: number; marker: ScopeMarker }
  const timeline = useMemo<TimelineItem[]>(() => {
    const queryItems: TimelineItem[] = queries.map((q) => ({
      type: 'query',
      key: `query-${q.id}`,
      timestamp: new Date(q.created_at).getTime(),
      query: q,
    }))
    const markerItems: TimelineItem[] = scopeMarkers.map((m) => ({
      type: 'marker',
      key: m.id,
      timestamp: m.timestamp,
      marker: m,
    }))
    return [...queryItems, ...markerItems].sort((a, b) => a.timestamp - b.timestamp)
  }, [queries, scopeMarkers])
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const isFirstLoad = prevQueriesLengthRef.current === 0
    const isNewMessage = timeline.length === prevQueriesLengthRef.current + 1
    const isLoadMore = timeline.length > prevQueriesLengthRef.current + 1
    if (isFirstLoad || isNewMessage) {
      // Scroll to bottom on first load, new message, or scope change marker
      el.scrollTop = el.scrollHeight
    } else if (isLoadMore) {
      // Preserve position when older messages prepended
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current
    }
    prevScrollHeightRef.current = el.scrollHeight
    prevQueriesLengthRef.current = timeline.length
  }, [timeline.length])
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }
  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const placeholderText = isRateLimited
    ? `Rate limited — available in ${formatCooldown(cooldownLeft)}`
    : isWaitingForResponse
      ? 'Waiting for the previous response...'
      : selectedProject
        ? `Ask about ${selectedProject.name}...`
        : 'Ask about budgets, materials, workforce, incidents...'

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <div ref={scrollRef} className="flex-1 px-5 py-4 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-transparent">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="ml-auto h-8 w-48 rounded-2xl" />
                <Skeleton className="h-12 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>Failed to load conversation history. Please refresh.</AlertDescription>
          </Alert>
        ) : timeline.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-24 text-zinc-400 dark:text-zinc-500">
            <Bot className="h-10 w-10" />
            <p className="text-sm">Ask anything about your construction projects.</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => onSubmit(q)}
                  disabled={isDisabled}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {hasNextPage && (
              <div className="flex justify-center py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isFetchingNextPage}
                  className="gap-1.5 text-xs text-zinc-500"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
                </Button>
              </div>
            )}
            {timeline.map((item) =>
              item.type === 'marker' ? (
                <div key={item.key} className="flex justify-center">
                  <div className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <FolderKanban className="h-3 w-3 text-primary" />
                    Switched to: {item.marker.projectName}
                  </div>
                </div>
              ) : (
                <ChatMessage key={item.key} query={item.query} onRateLimit={onRateLimit} />
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Select
            value={selectedProjectId !== null ? String(selectedProjectId) : 'all'}
            onValueChange={(v) => onProjectChange(v === 'all' ? null : Number(v))}
          >
            <SelectTrigger className="w-44 shrink-0 h-10">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder={placeholderText}
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none flex-1 disabled:cursor-not-allowed"
            disabled={isDisabled}
          />
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={isDisabled ? 'cursor-not-allowed' : ''}>
                  <Button
                    size="sm"
                    onClick={() => onSubmit()}
                    disabled={isDisabled || !question.trim()}
                    className={`h-10 w-10 ${isDisabled ? 'pointer-events-none' : ''}`}
                  >
                    {isWaitingForResponse ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {isRateLimited && (
                <TooltipContent>
                  <p>Rate limited. Available in {formatCooldown(cooldownLeft)}.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Press Enter to send, Shift+Enter for new line.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHistory}
            className="h-6 gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <History className="h-3.5 w-3.5" />
            {historyOpen ? 'Hide History' : 'Show History'}
          </Button>
        </div>
      </div>
    </div>
  )
}