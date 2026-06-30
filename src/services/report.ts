import { getReportsRequest, generateReportRequest, downloadReportRequest } from '@/api/report'
import type { ReportListResponse } from '@/types/report'
export const getReports = async (projectId: number, page: number, pageSize: number): Promise<ReportListResponse> => {
  const response = await getReportsRequest(projectId, page, pageSize)
  return response.data
}

export const downloadReport = async (projectId: number, reportId: number): Promise<void> => {
  const response = await downloadReportRequest(projectId, reportId)
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  window.open(url, '_blank')
  // revoke after a delay to allow the new tab to load the blob
  setTimeout(() => window.URL.revokeObjectURL(url), 60000)
}

export const generateReport = async (projectId: number): Promise<{ status: 'exists' | 'queued'; detail: string }> => {
  const response = await generateReportRequest(projectId)
  return response.data
}