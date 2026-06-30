import { z } from 'zod'

// --- Used in DailyLogPage (PM) ---
export const MaterialCreateSchema = z.object({
  name: z.string().min(1),
  quantity: z.number(),
  unit: z.string().min(1),
  unit_cost: z.number(),
})

export const MaterialUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().optional(),
  unit: z.string().min(1).optional(),
  unit_cost: z.number().optional(),
})

export const MaterialResponseSchema = z.object({
  id: z.number(),
  daily_log_id: z.number(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  unit_cost: z.number(),
  total_cost: z.number(),
})

// --- Inferred types ---
export type MaterialCreate = z.infer<typeof MaterialCreateSchema>
export type MaterialUpdate = z.infer<typeof MaterialUpdateSchema>
