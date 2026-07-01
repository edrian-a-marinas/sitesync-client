import { useQuery } from '@tanstack/react-query'
import { getMyProjects, getTodayLog } from '@/services/worker'

export const useMyProjects = () => {
  return useQuery({
    queryKey: ['worker', 'projects'],
    queryFn: getMyProjects,
  })
}

export const useTodayLog = (projectId: number | null) => {
  return useQuery({
    queryKey: ['worker', 'today-log', projectId],
    queryFn: () => getTodayLog(projectId!),
    enabled: projectId !== null,
    placeholderData: (prev) => prev,
  })
}
