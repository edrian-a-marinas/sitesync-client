import { getMaterialsRequest, createMaterialRequest, updateMaterialRequest, deleteMaterialRequest } from '@/api/material'
import type { MaterialCreate, MaterialUpdate } from '@/validations/material'
import type { MaterialResponse } from '@/types/material'

// --- Used in DailyLogPage (PM) ---
export const getMaterials = async (projectId: number, logId: number): Promise<MaterialResponse[]> => {
  const response = await getMaterialsRequest(projectId, logId)
  return response.data
}

export const createMaterial = async (projectId: number, logId: number, data: MaterialCreate): Promise<MaterialResponse> => {
  const response = await createMaterialRequest(projectId, logId, data)
  return response.data
}

export const updateMaterial = async (projectId: number, logId: number, materialId: number, data: MaterialUpdate): Promise<MaterialResponse> => {
  const response = await updateMaterialRequest(projectId, logId, materialId, data)
  return response.data
}

export const deleteMaterial = async (projectId: number, logId: number, materialId: number): Promise<void> => {
  await deleteMaterialRequest(projectId, logId, materialId)
}