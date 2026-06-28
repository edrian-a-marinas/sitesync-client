import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { Button } from '@/pages/_components/ui/button'
import { Textarea } from '@/pages/_components/ui/textarea'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/_components/ui/select'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'
import { Bot, Send } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { SUGGESTED_QUESTIONS, formatCooldown } from './utils'
import type { AIQueryResponse } from '@/types/aiQuery'
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
  onQuestionChange: (value: string) => void
  onProjectChange: (value: number | null) => void
  onSubmit: (text?: string) => void
  onRateLimit: (retryAfter: number) => void
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
  onQuestionChange,
  onProjectChange,
  onSubmit,
  onRateLimit,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [queries])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-5 py-4">
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
        ) : queries.length === 0 ? (
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
            {queries.map((q) => (
              <ChatMessage key={q.id} query={q} onRateLimit={onRateLimit} />
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
            onValueChange={(v) => onProjectChange(v === 'all' ? null : Number(v))}
          >
            <SelectTrigger className="w-44 shrink-0">
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
            placeholder={
              isRateLimited
                ? `Rate limited — available in ${formatCooldown(cooldownLeft)}`
                : 'Ask about budgets, materials, workforce, incidents...'
            }
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
  )
}