import { z } from 'zod'

export const ReportResponseSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  generated_by: z.number(),
  week_start: z.string(),
  week_end: z.string(),
  s3_key: z.string(),
  file_url: z.string().nullable(),
  created_at: z.string(),
})

// --- Inferred types ---
export type ReportResponseValidated = z.infer<typeof ReportResponseSchema>