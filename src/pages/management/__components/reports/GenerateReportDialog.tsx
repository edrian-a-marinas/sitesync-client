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
import { useState, useEffect } from 'react'
import { Loader2, Download } from 'lucide-react'
import { downloadReport } from '@/services/report'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
  isPolling: boolean
  newReport: ReportResponse | null
  cooldownUntil: number | null
}
export default function GenerateReportDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  isPolling,
  newReport,
  cooldownUntil,
}: Props) {
  const [cooldownLeft, setCooldownLeft] = useState(0)
  useEffect(() => {
    if (!cooldownUntil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets cooldown when timer target is cleared
      setCooldownLeft(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
      setCooldownLeft(remaining)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [cooldownUntil])
  const isCoolingDown = cooldownLeft > 0
  const isBusy = isPending || isPolling || isCoolingDown

  const handleDownload = async () => {
    if (newReport) {
      try {
        await downloadReport(newReport.project_id, newReport.id)
      } catch {
        toast.error('Failed to download report. Please try again.')
      }
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
              {isCoolingDown ? (
                `Try again in ${cooldownLeft}s`
              ) : isBusy ? (
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