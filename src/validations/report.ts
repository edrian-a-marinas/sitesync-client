import { z } from 'zod'

export const ReportResponseSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  generated_by: z.number(),
  generated_by_name: z.string().nullable(),
  week_start: z.string(),
  week_end: z.string(),
  s3_key: z.string(),
  source: z.enum(['manual', 'scheduled']),
  file_url: z.string().nullable(),
  total_hours: z.number(),
  total_material_cost: z.number(),
  log_count: z.number(),
  incident_count: z.number(),
  open_incident_count: z.number(),
  created_at: z.string(),
})

// --- Inferred types ---
export type ReportResponseValidated = z.infer<typeof ReportResponseSchema>
