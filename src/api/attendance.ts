import api from '@/lib/axios'
import type { AttendanceCreate } from '@/validations/attendance'

// --- Used in DailyLog Attendance ---
export const getAttendanceRequest = (projectId: number, logId: number) =>
  api.get(`/projects/${projectId}/daily-logs/${logId}/attendance`)

export const createAttendanceRequest = (
  projectId: number,
  logId: number,
  data: AttendanceCreate,
) => api.post(`/projects/${projectId}/daily-logs/${logId}/attendance`, data)

export const getMyAttendanceHistoryRequest = (
  projectId: number,
  page: number,
  limit: number,
) =>
  api.get(`/projects/${projectId}/daily-logs/attendance/me`, {
    params: { page, limit },
  })
