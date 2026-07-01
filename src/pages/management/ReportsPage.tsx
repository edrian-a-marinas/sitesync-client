import { useState, useEffect, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import type { ReportResponse, ReportsSearch } from '@/types/report'
import { useAuthStore } from '@/store/auth'
import { ROLES, ROUTES } from '@/constants'
import { useProjects } from '@/hooks/useProject'
import { useReports, useGenerateReport } from '@/hooks/useReport'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { FileText } from 'lucide-react'
import ReportFilters from './__components/reports/ReportFilters'
import ReportTable from './__components/reports/ReportTable'
import ReportDetailSheet from './__components/reports/ReportDetailSheet'
import GenerateReportDialog from './__components/reports/GenerateReportDialog'
import { toast } from 'sonner'
import { downloadReport } from '@/services/report'

export default function ReportsPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    project?: number
    page?: number
  }
  const selectedProjectId = searchParams.project ?? null
  const page = searchParams.page ?? 1
  const PAGE_SIZE = 20

  const [generateOpen, setGenerateOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(
    null,
  )
  const [isPolling, setIsPolling] = useState(false)
  const [newReport, setNewReport] = useState<ReportResponse | null>(null)
  const [pollStartedAt, setPollStartedAt] = useState<number | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const POLL_TIMEOUT_MS = 30000 // 30s real wall-clock budget, not tied to refetch count
  const COOLDOWN_MS = 30000 // 30s lockout after failure, no background requests
  const { data: projects, isLoading: projectsLoading } = useProjects('Active')
  const {
    data: reports,
    isLoading: reportsLoading,
    isError,
  } = useReports(
    selectedProjectId,
    page,
    PAGE_SIZE,
    isPolling ? 3000 : undefined,
  )
  const today = new Date().toISOString().slice(0, 10)
  const existsToday =
    reports?.items?.some(
      (r) => r.generated_by === user?.id && r.created_at.slice(0, 10) === today,
    ) ?? false
  const { mutate: generateReport, isPending: isGenerating } =
    useGenerateReport()
  const handleProjectChange = useCallback(
    (id: number) => {
      setSelectedReport(null)
      navigate({
        to: ROUTES.REPORTS,
        search: { project: id, page: 1 },
      })
    },
    [navigate],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate({
        to: ROUTES.REPORTS,
        search: (prev: Partial<ReportsSearch>) => ({ ...prev, page: newPage }),
      })
    },
    [navigate],
  )

  const totalPages = reports
    ? Math.max(1, Math.ceil(reports.total / reports.page_size))
    : 1

  const [baselineReportId, setBaselineReportId] = useState<number | null>(null)
  const handleGenerate = () => {
    if (!selectedProjectId) return
    setBaselineReportId(reports?.items?.[0]?.id ?? null)
    setNewReport(null)
    generateReport(selectedProjectId, {
      onSuccess: (data) => {
        if (data.status === 'exists') {
          setGenerateOpen(false)
          toast.info('A report for this week already exists.')
          return
        }
        // status === 'queued'
        setPollStartedAt(Date.now())
        setIsPolling(true)
        toast.info('Generating report... this may take a moment.')
      },
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status
        if (status === 503) {
          setGenerateOpen(false)
          setCooldownUntil(Date.now() + COOLDOWN_MS)
          toast.error(
            'Report service is temporarily unavailable. Please try again in a few minutes.',
          )
        } else {
          toast.error('Failed to generate report. Please try again.')
        }
      },
    })
  }

  useEffect(() => {
    if (!isPolling) return
    const latest = reports?.items?.[0]
    if (latest && latest.id !== baselineReportId) {
      // Syncing local state to external server data (poll result) — valid effect pattern per React docs
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPolling(false)
      setNewReport(latest)
      if (generateOpen) {
        toast.success('Report is ready to download.')
      } else {
        toast.success('Report is ready to download.', {
          action: {
            label: 'Download',
            onClick: () => {
              downloadReport(latest.project_id, latest.id).catch(() =>
                toast.error('Failed to download report. Please try again.'),
              )
            },
          },
        })
      }
      return
    }
    // No new report yet — stop only once real time budget is exceeded
    if (pollStartedAt && Date.now() - pollStartedAt >= POLL_TIMEOUT_MS) {
      setIsPolling(false)
      setGenerateOpen(false)
      setCooldownUntil(Date.now() + COOLDOWN_MS)
      toast.error(
        'Report generation timed out. The background service may be unavailable.',
      )
    }
  }, [reports, isPolling, baselineReportId, generateOpen, pollStartedAt])

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Reports{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              — {isOwner ? 'Owner' : 'PM'} View
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOwner
              ? 'View and generate weekly reports across all projects'
              : 'View and generate weekly reports for your assigned projects'}
          </p>
        </div>
        <ReportFilters
          projects={projects ?? []}
          projectsLoading={projectsLoading}
          selectedProjectId={selectedProjectId}
          onProjectChange={handleProjectChange}
          onGenerate={() => setGenerateOpen(true)}
          hasProject={selectedProjectId !== null}
          disableGenerate={existsToday}
          nextAvailableDate={
            existsToday
              ? // eslint-disable-next-line react-hooks/purity -- intentional: shows "next available" date relative to now
                new Date(Date.now() + 86400000).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null
          }
        />
      </div>

      {/* No project selected */}
      {selectedProjectId === null && (
        <div className="flex flex-col items-center gap-2 py-24 text-zinc-400 dark:text-zinc-500">
          <FileText className="h-10 w-10" />
          <p className="text-sm">Select a project to view its reports.</p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load reports. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {selectedProjectId !== null && (
        <ReportTable
          reports={reports?.items ?? []}
          isLoading={reportsLoading}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <ReportDetailSheet
        report={selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      />

      {/* Generate Dialog */}
      {selectedProjectId !== null && (
        <GenerateReportDialog
          open={generateOpen}
          onOpenChange={(open) => {
            setGenerateOpen(open)
            if (!open) {
              setNewReport(null)
            }
          }}
          onConfirm={handleGenerate}
          isPending={isGenerating}
          isPolling={isPolling}
          newReport={newReport}
          cooldownUntil={cooldownUntil}
        />
      )}
    </div>
  )
}
