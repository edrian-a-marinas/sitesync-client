import { z } from 'zod'

// --- Used in DailyLog Attendance ---
export const EquipmentCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  condition: z.string().optional(),
})

export const EquipmentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().min(1).optional(),
  condition: z.string().optional(),
})

// --- Inferred types ---
export type EquipmentCreate = z.infer<typeof EquipmentCreateSchema>
export type EquipmentUpdate = z.infer<typeof EquipmentUpdateSchema>
