import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useGetQueries, useCreateQuery } from '@/hooks/useAIQuery'
import { useProjects } from '@/hooks/useProject'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/pages/_components/ui/resizable'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { ChatPanel } from './__components/aiquery/ChatPanel'
import { QueryHistoryPanel } from './__components/aiquery/QueryHistoryPanel'
import { useCountdown, formatCooldown } from './__components/aiquery/utils'

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

  const cooldownLeft = useCountdown(rateLimitUntil)
  const isRateLimited = cooldownLeft > 0

  const { data: queries, isLoading: queriesLoading, isError: queriesError } = useGetQueries()
  const { data: projects } = useProjects()
  const { mutate: createQuery, isPending: isSubmitting } = useCreateQuery()

  const sortedQueries = [...(queries ?? [])].reverse()

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
        <ResizablePanel defaultSize={65} minSize={40}>
          <ChatPanel
            queries={sortedQueries}
            isLoading={queriesLoading}
            isError={queriesError}
            projects={projects ?? []}
            question={question}
            selectedProjectId={selectedProjectId}
            isDisabled={isDisabled}
            isRateLimited={isRateLimited}
            cooldownLeft={cooldownLeft}
            isSubmitting={isSubmitting}
            onQuestionChange={setQuestion}
            onProjectChange={setSelectedProjectId}
            onSubmit={handleSubmit}
            onRateLimit={handleRateLimit}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={25}>
          <QueryHistoryPanel queries={sortedQueries} isLoading={queriesLoading} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}