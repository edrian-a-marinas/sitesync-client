import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useGetQueries, useCreateQuery, useGetQuery } from '@/hooks/useAIQuery'
import { useProjects } from '@/hooks/useProject'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/pages/_components/ui/resizable'
import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { Button } from '@/pages/_components/ui/button'
import { Textarea } from '@/pages/_components/ui/textarea'
import { Badge } from '@/pages/_components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/_components/ui/select'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'
import { Bot, Send, User, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { AIQueryResponse } from '@/types/aiQuery'

const SUGGESTED_QUESTIONS = [
  'Which project has the highest budget overrun risk?',
  'How many incidents are still open across all projects?',
  'What is the material cost trend for Sta. Mesa this month?',
]

function parseAnswer(answer: string | null): { type: 'rate_limit'; retryAfter: number } | { type: 'timeout' } | { type: 'error' } | { type: 'ok'; text: string } | null {
  if (!answer) return null
  if (answer.startsWith('RATE_LIMIT:')) {
    const seconds = parseInt(answer.split(':')[1], 10)
    return { type: 'rate_limit', retryAfter: isNaN(seconds) ? 60 : seconds }
  }
  if (answer === 'TIMEOUT') return { type: 'timeout' }
  if (answer === 'ERROR') return { type: 'error' }
  return { type: 'ok', text: answer }
}

function useCountdown(until: number | null) {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!until) { setLeft(0); return }
    const tick = () => setLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [until])
  return left
}

function ChatMessage({ query, onRateLimit }: { query: AIQueryResponse; onRateLimit: (retryAfter: number) => void }) {
  const isPending = query.status === 'Pending'
  const { data: liveQuery } = useGetQuery(isPending ? query.id : null, isPending)
  const display = liveQuery ?? query
  const parsed = parseAnswer(display.answer)

  useEffect(() => {
    if (display.status === 'Failed' && parsed?.type === 'rate_limit') {
      onRateLimit(parsed.retryAfter)
      toast.error(`Groq rate limit reached. Try again in ${parsed.retryAfter}s.`)
    }
    if (display.status === 'Failed' && parsed?.type === 'timeout') {
      toast.error('AI response timed out. Please try again.')
    }
    if (display.status === 'Failed' && parsed?.type === 'error') {
      toast.error('AI query failed. Please try again.')
    }
  }, [display.status, display.answer])

  const renderAnswer = () => {
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
          <p className="text-sm">Groq rate limit reached. You can try again in {parsed.retryAfter} seconds.</p>
        </div>
      )
    }
    if (parsed.type === 'timeout') {
      return <p className="text-sm text-red-500">Request timed out. Please try again.</p>
    }
    if (parsed.type === 'error') {
      return <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
    }
    return <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{parsed.text}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Question */}
      <div className="flex items-start gap-2.5 justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5">
          <p className="text-sm text-white dark:text-zinc-900">{display.question}</p>
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
          {display.status === 'Pending' && (
            <Badge variant="outline" className="mt-1.5 bg-amber-50 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Thinking...
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OwnerAiAssistantPage() {
  const { user } = useAuthStore()
  if (user?.role_id !== ROLES.OWNER) return null

  const [question, setQuestion] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('groq_rate_limit_until')
    if (!stored) return null
    const parsed = Number(stored)
    return parsed > Date.now() ? parsed : null
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const cooldownLeft = useCountdown(rateLimitUntil)
  const isRateLimited = cooldownLeft > 0

  const { data: queries, isLoading: queriesLoading, isError: queriesError } = useGetQueries()
  const { data: projects } = useProjects()
  const { mutate: createQuery, isPending: isSubmitting } = useCreateQuery()

  const sortedQueries = [...(queries ?? [])].reverse()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [queries])

  const handleRateLimit = (retryAfter: number) => {
    const until = Date.now() + retryAfter * 1000
    setRateLimitUntil(until)
    localStorage.setItem('groq_rate_limit_until', String(until))
  }

  const handleSubmit = (text?: string) => {
    const trimmed = (text ?? question).trim()
    if (!trimmed || isSubmitting || isRateLimited) return
    createQuery(
      { question: trimmed, project_id: selectedProjectId },
      {
        onSuccess: () => setQuestion(''),
        onError: () => toast.error('Failed to send query. Please try again.'),
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  const isDisabled = isSubmitting || isRateLimited

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-0 px-6 pb-6 pt-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            AI Assistant{' '}
            <span className="text-zinc-400 dark:text-zinc-500">— Owner View</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Ask questions about your projects, budgets, materials, and workforce.
          </p>
        </div>
      </div>

      {/* Rate limit banner */}
      {isRateLimited && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            Groq API rate limit reached. Chat available again in <strong>{formatCooldown(cooldownLeft)}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Resizable layout */}
      <ResizablePanelGroup className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800">

        {/* Chat Panel */}
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="flex h-full flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 px-5 py-4">
              {queriesLoading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="ml-auto h-8 w-48 rounded-2xl" />
                      <Skeleton className="h-12 w-64 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : queriesError ? (
                <Alert variant="destructive">
                  <AlertDescription>Failed to load conversation history. Please refresh.</AlertDescription>
                </Alert>
              ) : sortedQueries.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-24 text-zinc-400 dark:text-zinc-500">
                  <Bot className="h-10 w-10" />
                  <p className="text-sm">Ask anything about your construction projects.</p>
                  <div className="flex flex-col gap-2 w-full max-w-sm">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSubmit(q)}
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
                  {sortedQueries.map((q) => (
                    <ChatMessage key={q.id} query={q} onRateLimit={handleRateLimit} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <div className="flex items-end gap-2">
                <Select
                  value={selectedProjectId !== null ? String(selectedProjectId) : 'all'}
                  onValueChange={(v) => setSelectedProjectId(v === 'all' ? null : Number(v))}
                >
                  <SelectTrigger className="w-44 shrink-0">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {(projects ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder={
                    isRateLimited
                      ? `Rate limited — available in ${formatCooldown(cooldownLeft)}`
                      : 'Ask about budgets, materials, workforce, incidents...'
                  }
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
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
                          onClick={() => handleSubmit()}
                          disabled={isDisabled || !question.trim()}
                          className={isDisabled ? 'pointer-events-none' : ''}
                        >
                          <Send className="h-4 w-4" />
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
              <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                Press Enter to send, Shift+Enter for new line.
              </p>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* History Panel */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Query History</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Last 90 days</p>
            </div>
            <ScrollArea className="flex-1">
              {queriesLoading ? (
                <div className="flex flex-col gap-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : sortedQueries.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
                  <AlertCircle className="h-6 w-6" />
                  <p className="text-xs">No queries yet.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
                  {sortedQueries.map((q) => {
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
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {parsed.text}
                          </p>
                        )}
                        {isRateLimit && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Rate limited by Groq API.
                          </p>
                        )}
                        {(isTimeout || isErr) && (
                          <p className="text-xs text-red-500">
                            {isTimeout ? 'Request timed out.' : 'Query failed.'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  )
}