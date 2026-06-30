import {
  getBudgetOverrunRequest,
  getDelayRiskRequest,
  getMaterialForecastRequest,
  getMLStatusRequest,
  triggerRetrainRequest,
} from '@/api/ml'
import type {
  BudgetOverrunResponse,
  DelayRiskResponse,
  MaterialForecastResponse,
  MLStatus,
} from '@/types/ml'

export const getBudgetOverrun = async (): Promise<BudgetOverrunResponse> => {
  const response = await getBudgetOverrunRequest()
  return response.data
}

export const getDelayRisk = async (): Promise<DelayRiskResponse> => {
  const response = await getDelayRiskRequest()
  return response.data
}

export const getMaterialForecast =
  async (): Promise<MaterialForecastResponse> => {
    const response = await getMaterialForecastRequest()
    return response.data
  }

export const getMLStatus = async (): Promise<MLStatus> => {
  const response = await getMLStatusRequest()
  return response.data
}

export const triggerRetrain = async (): Promise<{
  status: string
  detail: string
}> => {
  const response = await triggerRetrainRequest()
  return response.data
}
