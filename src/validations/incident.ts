import { z } from 'zod'

// --- Used in DailyLog Incident ---
export const IncidentCreateSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['Low', 'Medium', 'High'], {
    message: 'Severity is required',
  }),
  status: z.enum(['Open', 'Resolved']).default('Open'),
})

export const IncidentUpdateSchema = z.object({
  description: z.string().min(1).optional(),
  severity: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z.enum(['Open', 'Resolved']).optional(),
})

// --- Inferred types ---
export type IncidentCreate = z.infer<typeof IncidentCreateSchema>
export type IncidentUpdate = z.infer<typeof IncidentUpdateSchema>
