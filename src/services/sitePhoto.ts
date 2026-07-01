import {
  deleteSitePhotoRequest,
  downloadSitePhotoRequest,
  getSitePhotosRequest,
  uploadSitePhotoRequest,
} from '@/api/sitePhoto'
import type { SitePhotoResponse } from '@/validations/sitePhoto'

export const getSitePhotos = async (
  projectId: number,
  logId: number,
): Promise<SitePhotoResponse[]> => {
  const response = await getSitePhotosRequest(projectId, logId)
  return response.data
}

export const uploadSitePhoto = async (
  projectId: number,
  logId: number,
  file: File,
): Promise<SitePhotoResponse> => {
  const response = await uploadSitePhotoRequest(projectId, logId, file)
  return response.data
}

export const deleteSitePhoto = async (
  projectId: number,
  logId: number,
  photoId: number,
): Promise<void> => {
  await deleteSitePhotoRequest(projectId, logId, photoId)
}
export const downloadSitePhoto = async (
  projectId: number,
  logId: number,
  photoId: number,
  contentType: string,
): Promise<void> => {
  const response = await downloadSitePhotoRequest(projectId, logId, photoId)
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: contentType }),
  )
  window.open(url, '_blank')
  // revoke after a delay to allow the new tab to load the blob
  setTimeout(() => window.URL.revokeObjectURL(url), 60000)
}
