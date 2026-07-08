import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '@/services/notification'
import type {
  Notification,
  UnreadCountResponse,
} from '@/validations/notification'

const PAGE_SIZE = 6

export const useGetNotifications = () => {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) => getNotifications(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length + 1
    },
  })
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<{
        pages: Notification[][]
        pageParams: unknown[]
      }>(['notifications'], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((n) => ({ ...n, is_read: true })),
          ),
        }
      })
      queryClient.setQueryData<UnreadCountResponse>(
        ['notifications-unread-count'],
        () => ({ unread_count: 0 }),
      )
    },
  })
}
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      let wasUnread = false
      queryClient.setQueryData<{
        pages: Notification[][]
        pageParams: unknown[]
      }>(['notifications'], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.filter((n) => {
              if (n._id === notificationId && !n.is_read) wasUnread = true
              return n._id !== notificationId
            }),
          ),
        }
      })
      if (wasUnread) {
        queryClient.setQueryData<UnreadCountResponse>(
          ['notifications-unread-count'],
          (old) =>
            old ? { unread_count: Math.max(0, old.unread_count - 1) } : old,
        )
      }
    },
  })
}
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<{
        pages: Notification[][]
        pageParams: unknown[]
      }>(['notifications'], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((n) =>
              n._id === notificationId ? { ...n, is_read: true } : n,
            ),
          ),
        }
      })
      queryClient.setQueryData<UnreadCountResponse>(
        ['notifications-unread-count'],
        (old) =>
          old ? { unread_count: Math.max(0, old.unread_count - 1) } : old,
      )
    },
  })
}
