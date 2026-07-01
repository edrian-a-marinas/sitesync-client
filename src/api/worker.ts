import api from '@/lib/axios'

export const getMyProjectsRequest = () => api.get('/workers/me/projects')

export const getTodayLogRequest = (projectId: number) =>
  api.get(`/workers/me/projects/${projectId}/daily-logs/today`)
