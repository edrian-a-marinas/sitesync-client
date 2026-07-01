export interface WorkerProject {
  id: number
  name: string
  location: string
  status: string
  start_date: string
  target_end_date: string
  total_budget: number
}

export interface WorkerTodayLog {
  id: number
  project_id: number
  submitted_by: number
  submitted_by_name: string
  log_date: string
  weather_condition: string | null
  work_accomplished: string
  notes: string | null
}
