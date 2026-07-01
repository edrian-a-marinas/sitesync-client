import {
  getAttendanceRequest,
  createAttendanceRequest,
  getMyAttendanceHistoryRequest,
} from '@/api/attendance'
import type { AttendanceCreate } from '@/validations/attendance'
import type {
  AttendanceResponse,
  AttendanceHistoryListResponse,
} from '@/types/attendance'

// --- Used in DailyLog Attendance ---
export const getAttendance = async (
  projectId: number,
  logId: number,
): Promise<AttendanceResponse[]> => {
  const response = await getAttendanceRequest(projectId, logId)
  return response.data
}

export const createAttendance = async (
  projectId: number,
  logId: number,
  data: AttendanceCreate,
): Promise<AttendanceResponse> => {
  const response = await createAttendanceRequest(projectId, logId, data)
  return response.data
}

// --- Used in WorkerPage ---
export const getMyAttendanceHistory = async (
  projectId: number,
  page: number,
  limit: number,
): Promise<AttendanceHistoryListResponse> => {
  const response = await getMyAttendanceHistoryRequest(projectId, page, limit)
  return response.data
}
