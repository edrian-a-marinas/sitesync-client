import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createQuery, getQuery, getQueries } from '@/services/aiQuery'
import type { AIQueryRequest, AIQueryResponse } from '@/types/aiQuery'

export const useGetQueries = () => {
  return useQuery({
    queryKey: ['ai-queries'],
    queryFn: getQueries,
  })
}

const PENDING_TIMEOUT_MINUTES = 5

export const useGetQuery = (queryId: number | null, enabled: boolean) => {
  return useQuery({
    queryKey: ['ai-query', queryId],
    queryFn: () => getQuery(queryId!),
    enabled: !!queryId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.status !== 'Pending') return false
      if (data.answer) return false
      // Stop polling if older than timeout — backend will have expired it already
      const ageMs = Date.now() - new Date(data.created_at).getTime()
      if (ageMs > PENDING_TIMEOUT_MINUTES * 60 * 1000) return false
      return 2000
    },
  })
}

export const useCreateQuery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AIQueryRequest) => createQuery(data),
    onSuccess: (newQuery) => {
      queryClient.setQueryData<AIQueryResponse[]>(['ai-queries'], (old) => [
        ...(old ?? []),
        newQuery,
      ])
    },
  })
}