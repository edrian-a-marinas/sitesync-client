import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIncidents, createIncident, updateIncident, deleteIncident } from '@/services/incident'
import type { IncidentCreate, IncidentUpdate } from '@/validations/incident'

// --- Used in DailyLog Incident ---
export const useIncident = (projectId: number, logId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['incident', projectId, logId],
    queryFn: () => getIncidents(projectId, logId),
    enabled,
  })
}

export const useCreateIncident = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IncidentCreate) => createIncident(projectId, logId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', projectId, logId] })
    },
  })
}

export const useUpdateIncident = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ incidentId, data }: { incidentId: number; data: IncidentUpdate }) =>
      updateIncident(projectId, logId, incidentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', projectId, logId] })
    },
  })
}

export const useDeleteIncident = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incidentId: number) => deleteIncident(projectId, logId, incidentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', projectId, logId] })
    },
  })
}
