import api from '@/lib/axios'
import type { AIQueryRequest, AIQueryResponse } from '@/types/aiQuery'

export const createQueryRequest = (data: AIQueryRequest) =>
  api.post<AIQueryResponse>('/ai/query', data)

export const getQueryRequest = (queryId: number) =>
  api.get<AIQueryResponse>(`/ai/query/${queryId}`)

export const getQueriesRequest = () =>
  api.get<AIQueryResponse[]>('/ai/queries')
