import type { AIQueryRequest, AIQueryResponse } from '@/types/aiQuery'
import {
  createQueryRequest,
  getQueryRequest,
  getQueriesRequest,
} from '@/api/aiQuery'

export const createQuery = async (data: AIQueryRequest): Promise<AIQueryResponse> => {
  const response = await createQueryRequest(data)
  return response.data
}

export const getQuery = async (queryId: number): Promise<AIQueryResponse> => {
  const response = await getQueryRequest(queryId)
  return response.data
}

export const getQueries = async (): Promise<AIQueryResponse[]> => {
  const response = await getQueriesRequest()
  return response.data
}