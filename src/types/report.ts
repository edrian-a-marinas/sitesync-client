export interface ReportResponse {
  id: number
  project_id: number
  generated_by: number
  generated_by_name: string | null
  week_start: string
  week_end: string
  s3_key: string
  file_url: string | null
  total_hours: number
  total_material_cost: number
  log_count: number
  incident_count: number
  open_incident_count: number
  created_at: string
}