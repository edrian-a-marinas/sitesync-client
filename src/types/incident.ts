// --- Used in DailyLog Incident ---
export interface IncidentResponse {
  id: number
  daily_log_id: number
  reported_by: number
  description: string
  severity: string
  status: string
}
