export interface Notification {
  _id: string
  user_id: number
  type: string
  title: string
  message: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface UnreadCountResponse {
  unread_count: number
}
