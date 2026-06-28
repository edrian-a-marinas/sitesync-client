export interface ReportListResponse {
  items: ReportResponse[]
  total: number
  page: number
  page_size: number
}

export interface ReportsSearch {
  project?: number
  page: number
}

export interface ReportResponse {
  id: number
  project_id: number
  generated_by: number
  generated_by_name: string | null
  week_start: string
  week_end: string
  s3_key: string
  source: 'manual' | 'scheduled' | 'seeded'
  file_url: string | null
  total_hours: number
  total_material_cost: number
  log_count: number
  incident_count: number
  open_incident_count: number
  created_at: string
}