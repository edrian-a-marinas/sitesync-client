import api from '@/lib/axios'
import type { EquipmentCreate, EquipmentUpdate } from '@/validations/equipment'

// --- Used in DailyLog Attendance ---
export const getEquipmentRequest = (projectId: number, logId: number) =>
  api.get(`/projects/${projectId}/daily-logs/${logId}/equipment`)

export const createEquipmentRequest = (
  projectId: number,
  logId: number,
  data: EquipmentCreate,
) => api.post(`/projects/${projectId}/daily-logs/${logId}/equipment`, data)

export const updateEquipmentRequest = (
  projectId: number,
  logId: number,
  equipmentId: number,
  data: EquipmentUpdate,
) =>
  api.patch(
    `/projects/${projectId}/daily-logs/${logId}/equipment/${equipmentId}`,
    data,
  )

export const deleteEquipmentRequest = (
  projectId: number,
  logId: number,
  equipmentId: number,
) =>
  api.delete(
    `/projects/${projectId}/daily-logs/${logId}/equipment/${equipmentId}`,
  )
