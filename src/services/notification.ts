import type {
  Notification,
  UnreadCountResponse,
} from '@/validations/notification'
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAsReadRequest,
} from '@/api/notification'

export const getNotifications = async (
  page = 1,
  pageSize = 20,
): Promise<Notification[]> => {
  const response = await getNotificationsRequest(page, pageSize)
  return response.data
}

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await getUnreadCountRequest()
  return response.data
}

export const markAsRead = async (notificationId: string): Promise<void> => {
  await markAsReadRequest(notificationId)
}
