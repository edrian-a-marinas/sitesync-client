import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAttendance,
  createAttendance,
  getMyAttendanceHistory,
} from '@/services/attendance'
import type { AttendanceCreate } from '@/validations/attendance'

// --- Used in DailyLog Attendance ---
export const useAttendance = (
  projectId: number,
  logId: number,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['attendance', projectId, logId],
    queryFn: () => getAttendance(projectId, logId),
    enabled,
  })
}

export const useCreateAttendance = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AttendanceCreate) =>
      createAttendance(projectId, logId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', projectId, logId],
      })
    },
  })
}

// --- Used in WorkerPage ---
export const useMyAttendanceHistory = (
  projectId: number,
  page: number,
  limit: number,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['attendance', 'me', projectId, page, limit],
    queryFn: () => getMyAttendanceHistory(projectId, page, limit),
    enabled,
  })
}
