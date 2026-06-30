import {
  getIncidentsRequest,
  createIncidentRequest,
  updateIncidentRequest,
  deleteIncidentRequest,
} from '@/api/incident'
import type { IncidentCreate, IncidentUpdate } from '@/validations/incident'
import type { IncidentResponse } from '@/types/incident'

// --- Used in DailyLog Incident ---
export const getIncidents = async (
  projectId: number,
  logId: number,
): Promise<IncidentResponse[]> => {
  const response = await getIncidentsRequest(projectId, logId)
  return response.data
}

export const createIncident = async (
  projectId: number,
  logId: number,
  data: IncidentCreate,
): Promise<IncidentResponse> => {
  const response = await createIncidentRequest(projectId, logId, data)
  return response.data
}

export const updateIncident = async (
  projectId: number,
  logId: number,
  incidentId: number,
  data: IncidentUpdate,
): Promise<IncidentResponse> => {
  const response = await updateIncidentRequest(
    projectId,
    logId,
    incidentId,
    data,
  )
  return response.data
}

export const deleteIncident = async (
  projectId: number,
  logId: number,
  incidentId: number,
): Promise<void> => {
  const response = await deleteIncidentRequest(projectId, logId, incidentId)
  return response.data
}
