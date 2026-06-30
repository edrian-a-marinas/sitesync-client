import {
  getOwnerDashboardRequest,
  getManagerDashboardRequest,
  getManagerAggregateDashboardRequest,
  getWorkerDashboardRequest,
} from '@/api/dashboard'
import type {
  OwnerDashboard,
  ProjectManagerDashboard,
  ProjectManagerAggregateDashboard,
  WorkerDashboard,
} from '@/validations/dashboard'

export const getOwnerDashboard = async (
  year?: number,
): Promise<OwnerDashboard> => {
  const response = await getOwnerDashboardRequest(year)
  return response.data
}

export const getManagerDashboard = async (
  projectId: number,
): Promise<ProjectManagerDashboard> => {
  const response = await getManagerDashboardRequest(projectId)
  return response.data
}

export const getManagerAggregateDashboard =
  async (): Promise<ProjectManagerAggregateDashboard> => {
    const response = await getManagerAggregateDashboardRequest()
    return response.data
  }

export const getWorkerDashboard = async (): Promise<WorkerDashboard> => {
  const response = await getWorkerDashboardRequest()
  return response.data
}
