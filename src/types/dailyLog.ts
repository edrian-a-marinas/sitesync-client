export interface DailyLogResponse {
  id: number
  project_id: number
  submitted_by: number
  submitted_by_name: string
  log_date: string
  weather_condition: string | null
  work_accomplished: string
  notes: string | null
}