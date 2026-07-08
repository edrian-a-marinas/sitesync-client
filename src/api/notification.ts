import api from '@/lib/axios'
import type {
  Notification,
  UnreadCountResponse,
} from '@/validations/notification'

export const getNotificationsRequest = (page = 1, pageSize = 20) =>
  api.get<Notification[]>('/notifications', {
    params: { page, page_size: pageSize },
  })

export const getUnreadCountRequest = () =>
  api.get<UnreadCountResponse>('/notifications/unread-count')
export const markAsReadRequest = (notificationId: string) =>
  api.patch<{ status: string }>(`/notifications/${notificationId}/read`)
export const markAllAsReadRequest = () =>
  api.patch<{ status: string; modified_count: number }>(
    '/notifications/read-all',
  )
export const deleteNotificationRequest = (notificationId: string) =>
  api.delete<{ status: string }>(`/notifications/${notificationId}`)
