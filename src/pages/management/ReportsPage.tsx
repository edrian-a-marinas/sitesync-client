import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useProjects } from '@/hooks/useProject'
import { useReports, useGenerateReport } from '@/hooks/useReport'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { FileText } from 'lucide-react'
import ReportFilters from './__components/reports/ReportFilters'
import ReportTable from './__components/reports/ReportTable'
import GenerateReportDialog from './__components/reports/GenerateReportDialog'
import { toast } from 'sonner'

export default function ReportsPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)

  const { data: projects, isLoading: projectsLoading } = useProjects('Active')
  const { data: reports, isLoading: reportsLoading, isError } = useReports(selectedProjectId)
  const { mutate: generateReport, isPending: isGenerating } = useGenerateReport()

  const handleGenerate = () => {
    if (!selectedProjectId) return
    generateReport(selectedProjectId, {
      onSuccess: () => {
        setGenerateOpen(false)
        toast.success('Report generation started. It will be ready shortly.')
      },
      onError: (error: any) => {
        const status = error?.response?.status
        if (status === 200) {
          setGenerateOpen(false)
          toast.info('A report for this week already exists.')
        } else {
          toast.error('Failed to generate report. Please try again.')
        }
      },
    })
  }

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
        />
      )}

      {/* Generate Dialog */}
      {selectedProjectId !== null && (
        <GenerateReportDialog
          open={generateOpen}
          onOpenChange={setGenerateOpen}
          onConfirm={handleGenerate}
          isPending={isGenerating}
        />
      )}
    </div>
  )
}