import { getMyProjectsRequest, getTodayLogRequest } from '@/api/worker'
import type { WorkerProject, WorkerTodayLog } from '@/types/worker'

export const getMyProjects = async (): Promise<WorkerProject[]> => {
  const response = await getMyProjectsRequest()
  return response.data
}

export const getTodayLog = async (
  projectId: number,
): Promise<WorkerTodayLog> => {
  const response = await getTodayLogRequest(projectId)
  return response.data
}
