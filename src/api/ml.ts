import api from '@/lib/axios'

export const getBudgetOverrunRequest = () =>
  api.get('/ml/budget-overrun')

export const getDelayRiskRequest = () =>
  api.get('/ml/delay-risk')

export const getMaterialForecastRequest = () =>
  api.get('/ml/material-forecast')

export const getMLStatusRequest = () =>
  api.get('/ml/status')

export const triggerRetrainRequest = () =>
  api.post('/ml/retrain')