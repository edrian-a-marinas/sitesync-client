import api from '@/lib/axios'
import type { DailyLogCreate, DailyLogUpdate } from '@/validations/dailyLog'

export const getDailyLogsRequest = (projectId: number, page: number, pageSize: number) =>
  api.get(`/projects/${projectId}/daily-logs`, { params: { page, page_size: pageSize } })

export const getDailyLogByIdRequest = (projectId: number, logId: number) =>
  api.get(`/projects/${projectId}/daily-logs/${logId}`)

export const createDailyLogRequest = (projectId: number, data: DailyLogCreate) =>
  api.post(`/projects/${projectId}/daily-logs`, data)

export const updateDailyLogRequest = (projectId: number, logId: number, data: DailyLogUpdate) =>
  api.patch(`/projects/${projectId}/daily-logs/${logId}`, data)