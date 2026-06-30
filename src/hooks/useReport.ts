import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReports, generateReport } from '@/services/report'

export const useReports = (
  projectId: number | null,
  page: number = 1,
  pageSize: number = 20,
  refetchInterval?: number,
) => {
  return useQuery({
    queryKey: ['reports', projectId, page, pageSize],
    queryFn: () => getReports(projectId!, page, pageSize),
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
