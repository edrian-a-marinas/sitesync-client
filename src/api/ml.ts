import api from '@/lib/axios'

export const getBudgetOverrunRequest = () => api.get('/ml/budget-overrun')

export const getDelayRiskRequest = () => api.get('/ml/delay-risk')

export const getMaterialForecastRequest = () => api.get('/ml/material-forecast')

export const getMLStatusRequest = () =>
  api.get('/ml/status', {
    headers: { 'Cache-Control': 'no-cache' },
    params: { _t: Date.now() },
  })

export const triggerRetrainRequest = () => api.post('/ml/retrain')
