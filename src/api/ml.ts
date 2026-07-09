import axios from 'axios'
import api from '@/lib/axios'

export const getBudgetOverrunRequest = () => api.get('/ml/budget-overrun')

export const getDelayRiskRequest = () => api.get('/ml/delay-risk')

export const getMaterialForecastRequest = () => api.get('/ml/material-forecast')

export const getMLStatusRequest = () =>
  api.get('/ml/status', { params: { _t: Date.now() } })

export const triggerRetrainRequest = () => api.post('/ml/retrain')

// Note: health endpoint is outside /api/v1 prefix, so uses raw axios instead of the `api` instance
export const getCeleryHealthRequest = () =>
  axios.get(`${import.meta.env.VITE_API_URL}/health/celery`)
