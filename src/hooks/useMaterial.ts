import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/services/material'
import type { MaterialCreate, MaterialUpdate } from '@/validations/material'

// --- Used in DailyLogPage (PM) ---
export const useMaterials = (projectId: number, logId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['materials', projectId, logId],
    queryFn: () => getMaterials(projectId, logId),
    enabled,
  })
}

export const useCreateMaterial = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MaterialCreate) => createMaterial(projectId, logId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', projectId, logId] })
    },
  })
}

export const useUpdateMaterial = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ materialId, data }: { materialId: number; data: MaterialUpdate }) =>
      updateMaterial(projectId, logId, materialId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', projectId, logId] })
    },
  })
}

export const useDeleteMaterial = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (materialId: number) => deleteMaterial(projectId, logId, materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', projectId, logId] })
    },
  })
}