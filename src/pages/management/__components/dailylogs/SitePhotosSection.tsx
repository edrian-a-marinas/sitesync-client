import { useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useGetSitePhotos, useUploadSitePhoto } from '@/hooks/useSitePhoto'
import { SitePhotoUploadSchema } from '@/validations/sitePhoto'
import { Button } from '@/pages/_components/ui/button'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { ImageIcon, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  projectId: number
  logId: number
}

export default function SitePhotosSection({ projectId, logId }: Props) {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canUpload = user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER

  const { data: photos, isLoading } = useGetSitePhotos(projectId, logId, true)
  const { mutate: upload, isPending } = useUploadSitePhoto(projectId, logId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Frontend first layer validation
    const result = SitePhotoUploadSchema.safeParse({ file })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      e.target.value = ''
      return
    }

    upload(file, {
      onSuccess: () => toast.success('Photo uploaded successfully.'),
      onError: () => toast.error('Failed to upload photo. Please try again.'),
    })
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <ImageIcon className="h-3.5 w-3.5" />
          Site Photos
        </div>
        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              {isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !photos || photos.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">No photos attached to this log.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            photo.content_type.startsWith('image/') ? (
              <a key={photo.id} href={photo.file_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={photo.file_url}
                  alt={photo.filename}
                  className="h-24 w-full rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                />
              </a>
            ) : (
              <a
                key={photo.id}
                href={photo.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-24 w-full items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors gap-1.5"
              >
                <ImageIcon className="h-4 w-4" />
                {photo.filename}
              </a>
            )
          ))}
        </div>
      )}
    </div>
  )
}