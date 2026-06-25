import { getReportsRequest, generateReportRequest } from '@/api/report'
import type { ReportResponse } from '@/types/report'

export const getReports = async (projectId: number): Promise<ReportResponse[]> => {
  const response = await getReportsRequest(projectId)
  return response.data
}

export const generateReport = async (projectId: number): Promise<void> => {
  await generateReportRequest(projectId)
}