import { getAttendanceRequest, createAttendanceRequest, getMyAttendanceHistoryRequest } from '@/api/attendance'
import type { AttendanceCreate } from '@/validations/attendance'
import type { AttendanceResponse, AttendanceHistoryResponse } from '@/types/attendance'

// --- Used in DailyLog Attendance ---
export const getAttendance = async (projectId: number, logId: number): Promise<AttendanceResponse[]> => {
  const response = await getAttendanceRequest(projectId, logId)
  return response.data
}

export const createAttendance = async (projectId: number, logId: number, data: AttendanceCreate): Promise<AttendanceResponse> => {
  const response = await createAttendanceRequest(projectId, logId, data)
  return response.data
}

export const getMyAttendanceHistory = async (projectId: number, page: number, limit: number): Promise<AttendanceHistoryResponse[]> => {
  const response = await getMyAttendanceHistoryRequest(projectId, page, limit)
  return response.data
}