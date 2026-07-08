import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createQuery,
  getQuery,
  getQueries,
  deleteQuery,
  deleteAllQueries,
} from '@/services/aiQuery'
import type { AIQueryRequest, AIQueryResponse } from '@/types/aiQuery'

const PAGE_SIZE = 10

export const useGetQueries = () => {
  return useInfiniteQuery({
    queryKey: ['ai-queries'],
    queryFn: ({ pageParam = 0 }) => getQueries(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
  })
}

const PENDING_TIMEOUT_MINUTES = 5
const CLIENT_TIMEOUT_SECONDS = 30
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
      const ageMs = Date.now() - new Date(data.created_at).getTime()
      // Stop polling after client-side timeout — don't wait indefinitely on a stuck request
      if (ageMs > CLIENT_TIMEOUT_SECONDS * 1000) return false
      // Stop polling if older than backend expiry window too
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
      queryClient.setQueryData<{
        pages: AIQueryResponse[][]
        pageParams: unknown[]
      }>(['ai-queries'], (old) => {
        if (!old) return { pages: [[newQuery]], pageParams: [0] }
        // Prepend to first page — backend is desc so first page = newest
        // After reversal in sortedQueries this becomes the bottom
        const pages = [...old.pages]
        pages[0] = [newQuery, ...pages[0]]
        return { ...old, pages }
      })
    },
  })
}
export const useDeleteQuery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (queryId: number) => deleteQuery(queryId),
    onSuccess: (_, queryId) => {
      queryClient.setQueryData<{
        pages: AIQueryResponse[][]
        pageParams: unknown[]
      }>(['ai-queries'], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => page.filter((q) => q.id !== queryId)),
        }
      })
    },
  })
}
export const useDeleteAllQueries = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteAllQueries(),
    onSuccess: () => {
      queryClient.setQueryData<{
        pages: AIQueryResponse[][]
        pageParams: unknown[]
      }>(['ai-queries'], { pages: [[]], pageParams: [0] })
    },
  })
}
