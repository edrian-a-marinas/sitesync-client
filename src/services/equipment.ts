import {
  getEquipmentRequest,
  createEquipmentRequest,
  updateEquipmentRequest,
  deleteEquipmentRequest,
} from '@/api/equipment'
import type { EquipmentCreate, EquipmentUpdate } from '@/validations/equipment'
import type { EquipmentResponse } from '@/types/equipment'

// --- Used in DailyLog Attendance ---
export const getEquipment = async (
  projectId: number,
  logId: number,
): Promise<EquipmentResponse[]> => {
  const response = await getEquipmentRequest(projectId, logId)
  return response.data
}

export const createEquipment = async (
  projectId: number,
  logId: number,
  data: EquipmentCreate,
): Promise<EquipmentResponse> => {
  const response = await createEquipmentRequest(projectId, logId, data)
  return response.data
}

export const updateEquipment = async (
  projectId: number,
  logId: number,
  equipmentId: number,
  data: EquipmentUpdate,
): Promise<EquipmentResponse> => {
  const response = await updateEquipmentRequest(
    projectId,
    logId,
    equipmentId,
    data,
  )
  return response.data
}

export const deleteEquipment = async (
  projectId: number,
  logId: number,
  equipmentId: number,
): Promise<void> => {
  const response = await deleteEquipmentRequest(projectId, logId, equipmentId)
  return response.data
}
