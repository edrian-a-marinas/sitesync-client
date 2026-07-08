import axios from 'axios'
import { getToken, clearToken } from '@/lib/token'
import { handleDemoWriteBlocked } from '@/demo/demoInterceptor' // DEMO FEATURE: remove this import if demo mode is retired

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // {* DEMO FEATURE: remove this if-block if demo mode is retired
    if (handleDemoWriteBlocked(error)) {
      return Promise.reject(error)
    }
    // TO HERE  *}
    if (error.response?.status === 401) {
      const token = getToken()
      if (token) {
        clearToken()
        alert('Session expired. Please log in again.')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api

{
  /*
  
  api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getToken()
      if (token) {
        clearToken()
        alert('Session expired. Please log in again.')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api


  
  */
}
