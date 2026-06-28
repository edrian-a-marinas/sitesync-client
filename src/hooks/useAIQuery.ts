import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { createQuery, getQuery, getQueries } from '@/services/aiQuery'
import type { AIQueryRequest } from '@/types/aiQuery'

export const useGetQueries = () => {
  return useQuery({
    queryKey: ['ai-queries'],
    queryFn: getQueries,
  })
}

const MAX_POLL_DURATION_MS = 60_000 // stop polling after 60s

export const useGetQuery = (queryId: number | null, enabled: boolean) => {
  const startedAt = useRef<number | null>(null)

  return useQuery({
    queryKey: ['ai-query', queryId],
    queryFn: () => {
      if (!startedAt.current) startedAt.current = Date.now()
      return getQuery(queryId!)
    },
    enabled: !!queryId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.answer) return false
      if (data.status !== 'Pending') return false
      if (startedAt.current && Date.now() - startedAt.current > MAX_POLL_DURATION_MS) return false
      return 2000
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