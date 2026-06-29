import api from '@/lib/axios'
import type { SitePhotoResponse } from '@/validations/sitePhoto'

export const getSitePhotosRequest = (projectId: number, logId: number) =>
  api.get<SitePhotoResponse[]>(`/projects/${projectId}/daily-logs/${logId}/site-photos`)

export const uploadSitePhotoRequest = (projectId: number, logId: number, file: File) => {
  const formData = new FormData() //  File uploads require multipart/form-data so FormData is needed
  formData.append('file', file)
  return api.post<SitePhotoResponse>(
    `/projects/${projectId}/daily-logs/${logId}/site-photos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

export const deleteSitePhotoRequest = (projectId: number, logId: number, photoId: number) =>
  api.delete(`/projects/${projectId}/daily-logs/${logId}/site-photos/${photoId}`)