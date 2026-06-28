import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDailyLogs, createDailyLog, updateDailyLog } from '@/services/dailyLog'
import type { DailyLogCreate, DailyLogUpdate } from '@/validations/dailyLog'

export const useDailyLogs = (projectId: number | null, page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['daily-logs', projectId, page, pageSize],
    queryFn: () => getDailyLogs(projectId!, page, pageSize),
    enabled: projectId !== null,
    placeholderData: (prev) => prev,
  })
}

export const useCreateDailyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: DailyLogCreate }) =>
      createDailyLog(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs', projectId] })
    },
  })
}

export const useUpdateDailyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, logId, data }: { projectId: number; logId: number; data: DailyLogUpdate }) =>
      updateDailyLog(projectId, logId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs', projectId] })
    },
  })
}