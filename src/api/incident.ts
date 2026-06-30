import api from '@/lib/axios'
import type { IncidentCreate, IncidentUpdate } from '@/validations/incident'

// --- Used in DailyLog Incident ---
export const getIncidentsRequest = (projectId: number, logId: number) =>
  api.get(`/projects/${projectId}/daily-logs/${logId}/incidents`)

export const createIncidentRequest = (
  projectId: number,
  logId: number,
  data: IncidentCreate,
) => api.post(`/projects/${projectId}/daily-logs/${logId}/incidents`, data)

export const updateIncidentRequest = (
  projectId: number,
  logId: number,
  incidentId: number,
  data: IncidentUpdate,
) =>
  api.patch(
    `/projects/${projectId}/daily-logs/${logId}/incidents/${incidentId}`,
    data,
  )

export const deleteIncidentRequest = (
  projectId: number,
  logId: number,
  incidentId: number,
) =>
  api.delete(
    `/projects/${projectId}/daily-logs/${logId}/incidents/${incidentId}`,
  )
