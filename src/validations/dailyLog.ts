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

export type DailyLogCreate = z.infer<typeof DailyLogCreateSchema>
export type DailyLogUpdate = z.infer<typeof DailyLogUpdateSchema>