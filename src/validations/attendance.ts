import { z } from 'zod'

// --- Used in DailyLog Attendance ---
export const AttendanceCreateSchema = z.object({
  worker_id: z.number().min(1, 'Worker is required'),
  hours_worked: z.number().min(0.01, 'Hours must be greater than 0').max(24, 'Hours cannot exceed 24'),
})

// --- Inferred types ---
export type AttendanceCreate = z.infer<typeof AttendanceCreateSchema>