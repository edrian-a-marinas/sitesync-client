import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createQuery, getQuery, getQueries } from '@/services/aiQuery'
import type { AIQueryRequest } from '@/types/aiQuery'

export const useGetQueries = () => {
  return useQuery({
    queryKey: ['ai-queries'],
    queryFn: getQueries,
  })
}

export const useGetQuery = (queryId: number | null, enabled: boolean) => {
  return useQuery({
    queryKey: ['ai-query', queryId],
    queryFn: () => getQuery(queryId!),
    enabled: !!queryId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.answer) return false
      return data.status === 'Pending' ? 2000 : false
    },
  })
}

export const useCreateQuery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AIQueryRequest) => createQuery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-queries'] })
    },
  })
}