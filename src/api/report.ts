import api from '@/lib/axios'

export const getReportsRequest = (projectId: number, page: number, pageSize: number) =>
  api.get(`/reports/${projectId}`, { params: { page, page_size: pageSize } })

export const generateReportRequest = (projectId: number) =>
  api.post(`/reports/${projectId}/generate`)