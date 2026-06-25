export interface ReportResponse {
  id: number
  project_id: number
  generated_by: number
  week_start: string
  week_end: string
  s3_key: string
  file_url: string | null
  created_at: string
}