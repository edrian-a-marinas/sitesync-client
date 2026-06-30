import {
  deleteSitePhotoRequest,
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
