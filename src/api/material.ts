import api from '@/lib/axios'
import type { MaterialCreate, MaterialUpdate } from '@/validations/material'

// --- Used in DailyLogPage (PM) ---
export const getMaterialsRequest = (projectId: number, logId: number) =>
  api.get(`/projects/${projectId}/daily-logs/${logId}/materials`)

export const createMaterialRequest = (projectId: number, logId: number, data: MaterialCreate) =>
  api.post(`/projects/${projectId}/daily-logs/${logId}/materials`, data)

export const updateMaterialRequest = (projectId: number, logId: number, materialId: number, data: MaterialUpdate) =>
  api.patch(`/projects/${projectId}/daily-logs/${logId}/materials/${materialId}`, data)

export const deleteMaterialRequest = (projectId: number, logId: number, materialId: number) =>
  api.delete(`/projects/${projectId}/daily-logs/${logId}/materials/${materialId}`)