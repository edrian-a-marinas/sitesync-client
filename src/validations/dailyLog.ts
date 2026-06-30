import { z } from 'zod'

export const DailyLogCreateSchema = z.object({
  log_date: z.string().min(1),
  weather_condition: z.string().optional(),
  work_accomplished: z.string().min(1),
  notes: z.string().optional(),
})

export const DailyLogUpdateSchema = z.object({
  weather_condition: z.string().optional(),
  work_accomplished: z.string().min(1),
  notes: z.string().optional(),
})

export const DailyLogResponseSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  submitted_by: z.number(),
  submitted_by_name: z.string(),
  log_date: z.string(),
  weather_condition: z.string().nullable(),
  work_accomplished: z.string(),
  notes: z.string().nullable(),
})
export const DailyLogListResponseSchema = z.object({
  items: z.array(DailyLogResponseSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})
// --- Inferred types ---
export type DailyLogCreate = z.infer<typeof DailyLogCreateSchema>
export type DailyLogUpdate = z.infer<typeof DailyLogUpdateSchema>
export type DailyLogListResponseValidated = z.infer<
  typeof DailyLogListResponseSchema
>
