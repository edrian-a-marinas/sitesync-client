import api from '@/lib/axios'
import type { AIQueryRequest, AIQueryResponse } from '@/types/aiQuery'

export const createQueryRequest = (data: AIQueryRequest) =>
  api.post<AIQueryResponse>('/ai/query', data)

export const getQueryRequest = (queryId: number) =>
  api.get<AIQueryResponse>(`/ai/query/${queryId}`)

export const getQueriesRequest = (skip = 0, limit = 10) =>
  api.get<AIQueryResponse[]>('/ai/queries', { params: { skip, limit } })

export const deleteQueryRequest = (queryId: number) =>
  api.delete<void>(`/ai/query/${queryId}`)

export const deleteAllQueriesRequest = () =>
  api.delete<{ deleted: number }>('/ai/queries')