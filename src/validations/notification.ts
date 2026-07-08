import { z } from 'zod'

export const NotificationSchema = z.object({
  _id: z.string(),
  user_id: z.number(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.object({
    incident_id: z.number().optional(),
    daily_log_id: z.number().optional(),
    severity: z.string().optional(),
    project_name: z.string().nullable().optional(),
    log_date: z.string().nullable().optional(),
    project_id: z.number().optional(),
    total_budget: z.number().optional(),
    total_spent: z.number().optional(),
    report_id: z.number().optional(),
    week_start: z.string().optional(),
    week_end: z.string().optional(),
  }),
  is_read: z.boolean(),
  created_at: z.string(),
})

export const UnreadCountSchema = z.object({
  unread_count: z.number(),
})

// --- Inferred types ---
export type Notification = z.infer<typeof NotificationSchema>
export type UnreadCountResponse = z.infer<typeof UnreadCountSchema>
