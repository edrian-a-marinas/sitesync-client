// --- Used in DailyLog Attendance ---
export interface AttendanceResponse {
  id: number
  daily_log_id: number
  worker_id: number
  hours_worked: number
}

export interface AttendanceHistoryResponse {
  id: number
  daily_log_id: number
  hours_worked: number
  log_date: string
}

// --- Used in WorkerPage ---
export interface AttendanceHistoryListResponse {
  items: AttendanceHistoryResponse[]
  total: number
  page: number
  limit: number
}
