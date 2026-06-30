import api from '@/lib/axios'

export const getOwnerDashboardRequest = (year?: number) =>
  api.get('/dashboard/owner', { params: year ? { year } : undefined })

export const getManagerDashboardRequest = (projectId: number) =>
  api.get(`/dashboard/manager/${projectId}`)

export const getManagerAggregateDashboardRequest = () =>
  api.get('/dashboard/manager/aggregate')

export const getWorkerDashboardRequest = () => api.get('/dashboard/worker')
