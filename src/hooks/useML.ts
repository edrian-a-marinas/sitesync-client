import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBudgetOverrun,
  getDelayRisk,
  getMaterialForecast,
  getMLStatus,
  triggerRetrain,
} from '@/services/ml'

export const useMLStatus = () => {
  return useQuery({
    queryKey: ['ml-status'],
    queryFn: getMLStatus,
  })
}

export const useBudgetOverrun = () => {
  return useQuery({
    queryKey: ['ml-budget-overrun'],
    queryFn: getBudgetOverrun,
    placeholderData: (prev) => prev,
  })
}

export const useDelayRisk = () => {
  return useQuery({
    queryKey: ['ml-delay-risk'],
    queryFn: getDelayRisk,
    placeholderData: (prev) => prev,
  })
}

export const useMaterialForecast = () => {
  return useQuery({
    queryKey: ['ml-material-forecast'],
    queryFn: getMaterialForecast,
    placeholderData: (prev) => prev,
  })
}

export const useRetrainML = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerRetrain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-status'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['ml-status'] })
        queryClient.invalidateQueries({ queryKey: ['ml-budget-overrun'] })
        queryClient.invalidateQueries({ queryKey: ['ml-delay-risk'] })
        queryClient.invalidateQueries({ queryKey: ['ml-material-forecast'] })
      }, 3000)
    },
  })
}
