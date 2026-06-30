import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '@/services/equipment'
import type { EquipmentCreate, EquipmentUpdate } from '@/validations/equipment'

// --- Used in DailyLog Attendance ---
export const useEquipment = (projectId: number, logId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['equipment', projectId, logId],
    queryFn: () => getEquipment(projectId, logId),
    enabled,
  })
}

export const useCreateEquipment = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EquipmentCreate) => createEquipment(projectId, logId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', projectId, logId] })
    },
  })
}

export const useUpdateEquipment = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ equipmentId, data }: { equipmentId: number; data: EquipmentUpdate }) =>
      updateEquipment(projectId, logId, equipmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', projectId, logId] })
    },
  })
}

export const useDeleteEquipment = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (equipmentId: number) => deleteEquipment(projectId, logId, equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', projectId, logId] })
    },
  })
}