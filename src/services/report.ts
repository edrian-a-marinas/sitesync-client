import { getReportsRequest, generateReportRequest } from '@/api/report'
import type { ReportListResponse } from '@/types/report'
export const getReports = async (projectId: number, page: number, pageSize: number): Promise<ReportListResponse> => {
  const response = await getReportsRequest(projectId, page, pageSize)
  return response.data
}

export const generateReport = async (projectId: number): Promise<{ status: 'exists' | 'queued'; detail: string }> => {
  const response = await generateReportRequest(projectId)
  return response.data
}