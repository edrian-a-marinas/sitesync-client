import api from '@/lib/axios'

export const getReportsRequest = (projectId: number) =>
  api.get(`/reports/${projectId}`)

export const generateReportRequest = (projectId: number) =>
  api.post(`/reports/${projectId}/generate`)