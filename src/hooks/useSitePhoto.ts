import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  deleteSitePhoto,
  getSitePhotos,
  uploadSitePhoto,
} from '@/services/sitePhoto'

export const useGetSitePhotos = (
  projectId: number,
  logId: number,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['site-photos', projectId, logId],
    queryFn: () => getSitePhotos(projectId, logId),
    enabled,
  })
}

export const useUploadSitePhoto = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadSitePhoto(projectId, logId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['site-photos', projectId, logId],
      })
    },
  })
}

export const useDeleteSitePhoto = (projectId: number, logId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photoId: number) => deleteSitePhoto(projectId, logId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['site-photos', projectId, logId],
      })
    },
  })
}
