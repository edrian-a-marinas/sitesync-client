import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReports, generateReport } from '@/services/report'

export const useReports = (projectId: number | null, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['reports', projectId],
    queryFn: () => getReports(projectId!),
    enabled: projectId !== null,
    placeholderData: (prev) => prev,
    refetchInterval: refetchInterval ?? false,
  })
}

export const useGenerateReport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: number) => generateReport(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['reports', projectId] })
    },
  })
}