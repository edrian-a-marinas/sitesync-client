import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // cache is fresh for 5 mins, refetches in background after
      refetchOnWindowFocus: false,
    },
  },
})

export default queryClient
