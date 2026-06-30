// --- Used in DailyLog Attendance ---
export interface EquipmentResponse {
  id: number
  daily_log_id: number
  name: string
  quantity: number
  condition: string | null
}
