import { useState, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth'
import { ROLES, ROUTES } from '@/constants'
import { useProjects } from '@/hooks/useProject'
import { useDailyLogs } from '@/hooks/useDailyLog'
import type { DailyLogResponse, DailyLogsSearch } from '@/types/dailyLog'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { ClipboardList } from 'lucide-react'
import DailyLogFilters from './__components/dailylogs/DailyLogFilters'
import DailyLogSearch from './__components/dailylogs/DailyLogSearch'
import DailyLogTable from './__components/dailylogs/DailyLogTable'
import CreateLogDialog from './__components/dailylogs/CreateLogDialog'
import EditLogDialog from './__components/dailylogs/EditLogDialog'
import LogDetailSheet from './__components/dailylogs/LogDetailSheet'

export default function DailyLogsPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER
  const isDemo = user?.is_demo ?? false // DEMO FEATURE: remove this line if demo mode is retired
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    project?: number
    page?: number
    search?: string
  }
  const selectedProjectId = searchParams.project ?? null
  const page = searchParams.page ?? 1
  const search = searchParams.search ?? ''
  const [selectedLog, setSelectedLog] = useState<DailyLogResponse | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editLog, setEditLog] = useState<DailyLogResponse | null>(null)
  const PAGE_SIZE = 10
  const { data: projects, isLoading: projectsLoading } = useProjects('Active')
  const {
    data: logs,
    isLoading: logsLoading,
    isError,
  } = useDailyLogs(selectedProjectId, page, PAGE_SIZE, search)
  const handleSearchChange = useCallback(
    (value: string) => {
      navigate({
        to: ROUTES.DAILY_LOGS,
        search: (prev: Partial<DailyLogsSearch>) => ({
          ...prev,
          search: value,
          page: 1,
        }),
      })
    },
    [navigate],
  )
  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate({
        to: ROUTES.DAILY_LOGS,
        search: (prev: Partial<DailyLogsSearch>) => ({
          ...prev,
          search: prev.search ?? '',
          page: newPage,
        }),
      })
    },
    [navigate],
  )
  const handleProjectChange = useCallback(
    (id: number) => {
      setSelectedLog(null)
      navigate({
        to: ROUTES.DAILY_LOGS,
        search: { project: id, page: 1, search: '' },
      })
    },
    [navigate],
  )
  const totalPages = logs
    ? Math.max(1, Math.ceil(logs.total / logs.page_size))
    : 1

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Daily Logs{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              — {isOwner ? 'Owner' : 'PM'} View
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOwner
              ? 'View daily site logs across all projects'
              : 'Submit and manage daily site logs for your assigned projects'}
          </p>
          {/*  DEMO FEATURE: remove this line if demo mode is retired */}
          {isDemo && (
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Note: demo data includes future-dated logs for ongoing demo
              purposes.
            </p>
          )}
        </div>
        <DailyLogFilters
          projects={projects ?? []}
          projectsLoading={projectsLoading}
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
          onNewLog={() => setCreateOpen(true)}
        />
      </div>

      {selectedProjectId !== null && (
        <DailyLogSearch onSearchChange={handleSearchChange} />
      )}
      {selectedProjectId === null && (
        <div className="flex flex-col items-center gap-2 py-24 text-zinc-400 dark:text-zinc-500">
          <ClipboardList className="h-10 w-10" />
          <p className="text-sm">Select a project to view its daily logs.</p>
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load daily logs. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {selectedProjectId !== null && (
        <DailyLogTable
          logs={logs?.items ?? []}
          isLoading={logsLoading}
          selectedLog={selectedLog}
          onSelectLog={(log) =>
            setSelectedLog((prev) => (prev?.id === log.id ? null : log))
          }
          onEditLog={setEditLog}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      <LogDetailSheet
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
      <EditLogDialog
        log={editLog}
        projectId={selectedProjectId ?? 0}
        onOpenChange={(open) => {
          if (!open) setEditLog(null)
        }}
      />
      {selectedProjectId !== null && (
        <CreateLogDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          projectId={selectedProjectId}
          existingDates={(logs?.items ?? []).map((l) => l.log_date)}
        />
      )}
    </div>
  )
}
