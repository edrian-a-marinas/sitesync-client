import {
  getDailyLogsRequest,
  getDailyLogByIdRequest,
  createDailyLogRequest,
  updateDailyLogRequest,
} from '@/api/dailyLog'
import type { DailyLogCreate, DailyLogUpdate } from '@/validations/dailyLog'
import type { DailyLogResponse } from '@/types/dailyLog'

export const getDailyLogs = async (projectId: number): Promise<DailyLogResponse[]> => {
  const response = await getDailyLogsRequest(projectId)
  return response.data
}

export const getDailyLogById = async (projectId: number, logId: number): Promise<DailyLogResponse> => {
  const response = await getDailyLogByIdRequest(projectId, logId)
  return response.data
}

export const createDailyLog = async (projectId: number, data: DailyLogCreate): Promise<DailyLogResponse> => {
  const response = await createDailyLogRequest(projectId, data)
  return response.data
}

export const updateDailyLog = async (projectId: number, logId: number, data: DailyLogUpdate): Promise<DailyLogResponse> => {
  const response = await updateDailyLogRequest(projectId, logId, data)
  return response.data
}