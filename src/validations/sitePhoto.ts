import { z } from 'zod'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const SitePhotoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => ALLOWED_TYPES.includes(f.type as typeof ALLOWED_TYPES[number]), {
      message: 'Only JPEG, PNG, WebP, and PDF files are allowed.',
    })
    .refine((f) => f.size <= MAX_FILE_SIZE, {
      message: 'File must not exceed 10MB.',
    }),
})

export const SitePhotoResponseSchema = z.object({
  id: z.number(),
  daily_log_id: z.number(),
  uploaded_by: z.number(),
  filename: z.string(),
  content_type: z.string(),
  s3_key: z.string(),
  uploaded_at: z.string(),
  file_url: z.string(),
})

export type SitePhotoUploadInput = z.infer<typeof SitePhotoUploadSchema>
export type SitePhotoResponse = z.infer<typeof SitePhotoResponseSchema>