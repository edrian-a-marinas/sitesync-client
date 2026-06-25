import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'
import type { ReportResponse } from '@/types/report'
import { Loader2, Download } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
  isPolling: boolean
  newReport: ReportResponse | null
}

export default function GenerateReportDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  isPolling,
  newReport,
}: Props) {
  const isBusy = isPending || isPolling

  const handleDownload = () => {
    if (newReport?.file_url) {
      window.open(newReport.file_url, '_blank')
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Generate Weekly Report?</AlertDialogTitle>
          <AlertDialogDescription>
            {newReport
              ? 'Your report has been generated and is ready to download.'
              : 'This will generate a PDF report for the selected project covering the past 7 days. The report will be uploaded to storage and available for download once ready.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {newReport ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {newReport ? (
            <AlertDialogAction onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={onConfirm} disabled={isBusy}>
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? 'Generating...' : 'Waiting for report...'}
                </>
              ) : (
                'Generate Report'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}