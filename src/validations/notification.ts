import { z } from 'zod'

export const NotificationSchema = z.object({
  _id: z.string(),
  user_id: z.number(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.string(), z.unknown()),
  is_read: z.boolean(),
  created_at: z.string(),
})

export const UnreadCountSchema = z.object({
  unread_count: z.number(),
})

// --- Inferred types ---
export type Notification = z.infer<typeof NotificationSchema>
export type UnreadCountResponse = z.infer<typeof UnreadCountSchema>
