import { useState, useEffect } from 'react'
import type { ReportResponse } from '@/types/report'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useProjects } from '@/hooks/useProject'
import { useReports, useGenerateReport } from '@/hooks/useReport'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { FileText } from 'lucide-react'
import ReportFilters from './__components/reports/ReportFilters'
import ReportTable from './__components/reports/ReportTable'
import ReportDetailSheet from './__components/reports/ReportDetailSheet'
import GenerateReportDialog from './__components/reports/GenerateReportDialog'
import { toast } from 'sonner'

export default function ReportsPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [newReport, setNewReport] = useState<ReportResponse | null>(null)
  const [pollAttempts, setPollAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const MAX_POLL_ATTEMPTS = 10 // 10 x 3s = 30s max wait
  const COOLDOWN_MS = 30000 // 30s lockout after failure, no background requests
  const { data: projects, isLoading: projectsLoading } = useProjects('Active')
  const { data: reports, isLoading: reportsLoading, isError } = useReports(
    selectedProjectId,
    isPolling ? 3000 : undefined,
  )
  const today = new Date().toISOString().slice(0, 10)
  const latestReportDate = reports?.[0]?.created_at ? reports[0].created_at.slice(0, 10) : null
  const existsThisWeek = latestReportDate === today
  const { mutate: generateReport, isPending: isGenerating } = useGenerateReport()
  const [baselineReportId, setBaselineReportId] = useState<number | null>(null)

  const handleGenerate = () => {
    if (!selectedProjectId) return
    setBaselineReportId(reports?.[0]?.id ?? null)
    setNewReport(null)
    generateReport(selectedProjectId, {
      onSuccess: (data) => {
        if (data.status === 'exists') {
          setGenerateOpen(false)
          toast.info('A report for this week already exists.')
          return
        }
        // status === 'queued'
        setPollAttempts(0)
        setIsPolling(true)
        toast.info('Generating report... this may take a moment.')
      },
      onError: (error: any) => {
        const status = error?.response?.status
        if (status === 503) {
          setGenerateOpen(false)
          setCooldownUntil(Date.now() + COOLDOWN_MS)
          toast.error('Report service is temporarily unavailable. Please try again in a few minutes.')
        } else {
          toast.error('Failed to generate report. Please try again.')
        }
      },
    })
  }

  useEffect(() => {
    if (!isPolling) return
    const latest = reports?.[0]
    if (latest && latest.id !== baselineReportId) {
      setIsPolling(false)
      setNewReport(latest)
      if (generateOpen) {
        toast.success('Report is ready to download.')
      } else {
        toast.success('Report is ready to download.', {
          action: {
            label: 'Download',
            onClick: () => latest.file_url && window.open(latest.file_url, '_blank'),
          },
        })
      }
      return
    }
    // No new report yet — count this poll attempt, stop after max reached
    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      setIsPolling(false)
      setGenerateOpen(false)
      setCooldownUntil(Date.now() + COOLDOWN_MS)
      toast.error('Report generation timed out. The background service may be unavailable.')
      return
    }
    setPollAttempts((prev) => prev + 1)
  }, [reports, isPolling, baselineReportId, generateOpen, pollAttempts])

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
          onProjectChange={(id) => setSelectedProjectId(id)}
          onGenerate={() => setGenerateOpen(true)}
          hasProject={selectedProjectId !== null}
          disableGenerate={existsThisWeek}
          nextAvailableDate={
            existsThisWeek
              ? new Date(Date.now() + 86400000).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'short', day: 'numeric',
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
          <AlertDescription>Failed to load reports. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      {selectedProjectId !== null && (
        <ReportTable
          reports={reports ?? []}
          isLoading={reportsLoading}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
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