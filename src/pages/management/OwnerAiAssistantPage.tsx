import { useState, useMemo } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useGetQueries, useCreateQuery, useDeleteQuery, useDeleteAllQueries } from '@/hooks/useAIQuery'
import { useProjects } from '@/hooks/useProject'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { ChatPanel } from './__components/aiquery/ChatPanel'
import { QueryHistoryPanel } from './__components/aiquery/QueryHistoryPanel'
import { useCountdown, formatCooldown } from './__components/aiquery/utils'
import type { ScopeMarker } from './__components/aiquery/utils'

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

  const { data: queriesData, isLoading: queriesLoading, isError: queriesError, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetQueries()
  const { data: projects } = useProjects('Active')
  const [scopeMarkers, setScopeMarkers] = useState<ScopeMarker[]>([])
  const { mutate: createQuery, isPending: isSubmitting } = useCreateQuery()
  const { mutate: deleteQuery } = useDeleteQuery()
  const { mutate: deleteAllQueries, isPending: isDeletingAll } = useDeleteAllQueries()
  const [historyOpen, setHistoryOpen] = useState(false)

  const sortedQueries = useMemo(() => {
    if (!queriesData) return []

    const allPages = [...queriesData.pages].reverse()
    return allPages.flatMap((page) => [...page].reverse())
  }, [queriesData])

  const isWaitingForResponse = sortedQueries[sortedQueries.length - 1]?.status === 'Pending'

  const handleRateLimit = (retryAfter: number) => {
    const until = Date.now() + retryAfter * 1000
    setRateLimitUntil(until)
    localStorage.setItem('groq_rate_limit_until', String(until))
  }
  const handleProjectChange = (projectId: number | null) => {
    setSelectedProjectId(projectId)
    const projectName = projectId === null
      ? 'All projects'
      : projects?.find((p) => p.id === projectId)?.name ?? 'Unknown project'
    setScopeMarkers((prev) => [...prev, { id: `scope-${Date.now()}`, timestamp: Date.now(), projectName }])
  }
  const handleDeleteQuery = (queryId: number) => {
    deleteQuery(queryId, {
      onError: () => toast.error('Failed to delete query. Please try again.'),
    })
  }
  const handleDeleteAll = () => {
    deleteAllQueries(undefined, {
      onSuccess: (data) => toast.success(`Deleted ${data.deleted} ${data.deleted === 1 ? 'query' : 'queries'}.`),
      onError: () => toast.error('Failed to delete all queries. Please try again.'),
    })
  }

  const handleSubmit = (text?: string) => {
    const trimmed = (text ?? question).trim()
    if (!trimmed || isSubmitting || isRateLimited || isWaitingForResponse) return
    createQuery(
      { question: trimmed, project_id: selectedProjectId },
      {
        onSuccess: () => setQuestion(''),
        onError: () => toast.error('Failed to send query. Please try again.'),
      }
    )
  }
  const isDisabled = isSubmitting || isRateLimited || isWaitingForResponse

  return (
    <div className="flex h-[calc(100vh-128px)] flex-col gap-0 px-0 pb-0 pt-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
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
      <div className="mx-auto flex w-full max-w-4xl flex-1 overflow-hidden">
        <div className="flex flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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
            isWaitingForResponse={isWaitingForResponse}
            onQuestionChange={setQuestion}
            onProjectChange={handleProjectChange}
            onSubmit={handleSubmit}
            onRateLimit={handleRateLimit}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            onToggleHistory={() => setHistoryOpen((v) => !v)}
            historyOpen={historyOpen}
            scopeMarkers={scopeMarkers}
          />
        </div>
      </div>
      {historyOpen && (
        <div className="fixed right-6 top-16 h-[calc(100vh-88px)] w-72 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-50">
          <QueryHistoryPanel
            queries={sortedQueries}
            isLoading={queriesLoading}
            onClose={() => setHistoryOpen(false)}
            onDeleteQuery={handleDeleteQuery}
            onDeleteAll={handleDeleteAll}
            isDeletingAll={isDeletingAll}
          />
        </div>
      )}
    </div>
  )
}