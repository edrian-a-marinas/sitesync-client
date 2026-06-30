import type { AIQueryRequest, AIQueryResponse } from '@/types/aiQuery'
import {
  createQueryRequest,
  getQueryRequest,
  getQueriesRequest,
  deleteQueryRequest,
  deleteAllQueriesRequest,
} from '@/api/aiQuery'

export const createQuery = async (
  data: AIQueryRequest,
): Promise<AIQueryResponse> => {
  const response = await createQueryRequest(data)
  return response.data
}

export const getQuery = async (queryId: number): Promise<AIQueryResponse> => {
  const response = await getQueryRequest(queryId)
  return response.data
}

export const getQueries = async (
  skip = 0,
  limit = 10,
): Promise<AIQueryResponse[]> => {
  const response = await getQueriesRequest(skip, limit)
  return response.data
}
export const deleteQuery = async (queryId: number): Promise<void> => {
  await deleteQueryRequest(queryId)
}
export const deleteAllQueries = async (): Promise<{ deleted: number }> => {
  const response = await deleteAllQueriesRequest()
  return response.data
}
