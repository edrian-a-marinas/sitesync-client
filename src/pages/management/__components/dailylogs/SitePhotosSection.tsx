import { useRef, useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useGetSitePhotos, useUploadSitePhoto, useDeleteSitePhoto } from '@/hooks/useSitePhoto'
import { SitePhotoUploadSchema } from '@/validations/sitePhoto'
import { Button } from '@/pages/_components/ui/button'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { createPortal } from 'react-dom'
import { ImageIcon, UploadCloud, ChevronLeft, ChevronRight, FileText, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'
import { toast } from 'sonner'

interface Props {
  projectId: number
  logId: number
}

export default function SitePhotosSection({ projectId, logId }: Props) {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canUpload = user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  const { data: photos, isLoading } = useGetSitePhotos(projectId, logId, true)
  const { mutate: upload, isPending } = useUploadSitePhoto(projectId, logId)
  const { mutate: deletePhoto, isPending: isDeleting } = useDeleteSitePhoto(projectId, logId)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const handleDeleteConfirm = () => {
    if (deleteTarget === null) return
    deletePhoto(deleteTarget, {
      onSuccess: () => {
        toast.success('Attachment deleted.')
        setDeleteTarget(null)
        setActiveIndex(null)
      },
      onError: () => {
        toast.error('Failed to delete. Please try again.')
        setDeleteTarget(null)
      },
    })
  }

  const total = photos?.length ?? 0
  const activePhoto = activeIndex !== null ? photos?.[activeIndex] : null

  const goPrev = () => setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  const goNext = () => setActiveIndex((i) => (i !== null && i < total - 1 ? i + 1 : i))

  useEffect(() => {
    if (activeIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIndex, total])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (total >= 10) {
      toast.error('Maximum of 10 attachments per log reached.')
      e.target.value = ''
      return
    }
    const result = SitePhotoUploadSchema.safeParse({ file })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      e.target.value = ''
      return
    }
    upload(file, {
      onSuccess: (photo) => {
        const img = new Image()
        img.src = photo.file_url
        img.onload = () => {
          toast.success('Photo uploaded successfully.', {
            description: photo.filename,
            action: {
              label: 'View',
              onClick: () => setPendingUrl(photo.file_url),
            },
          })
        }
      },
      onError: () => toast.error('Failed to upload. Please try again.'),
    })
    e.target.value = ''
  }

  const NavBar = ({ index, onPrev, onNext }: { index: number; onPrev: () => void; onNext: () => void }) => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 rounded-full px-6 py-2 z-[60]">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={index === 0}
        className="text-zinc-300 hover:text-white disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="text-sm text-zinc-300">{index + 1} of {total}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={index === total - 1}
        className="text-zinc-300 hover:text-white disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 cursor-default">
                <ImageIcon className="h-3.5 w-3.5" />
                Site Photos & Documents
                <span className="ml-1 text-zinc-300 dark:text-zinc-600">({total}/10)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{total >= 10 ? 'Maximum of 10 attachments reached.' : `${total} of 10 attachments used.`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    disabled={isPending || total >= 10}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: isPending ? 'wait' : undefined }}
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    {isPending ? 'Uploading...' : 'Upload'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{total >= 10 ? 'Maximum of 10 attachments reached.' : `${total}/10 attachments used.`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !photos || photos.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">No attachments for this log.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) =>
            photo.content_type.startsWith('image/') ? (
              <div key={photo.id} className="relative group">
                <button
                  onClick={() => setActiveIndex(index)}
                  className="h-24 w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img
                    src={photo.file_url}
                    alt={photo.filename}
                    className="h-full w-full object-cover"
                  />
                </button>
                {canUpload && (
                  <button
                    onClick={() => setDeleteTarget(photo.id)}
                    className="absolute top-1 right-1 z-10 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div key={photo.id} className="relative group">
                <a
                  href={photo.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-24 w-full items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  PDF Document
                </a>
                {canUpload && (
                  <button
                    onClick={() => setDeleteTarget(photo.id)}
                    className="absolute top-1 right-1 z-10 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Lightbox — existing photos */}
      {activeIndex !== null && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Overlay — click to close */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveIndex(null)}
          />
          {/* Image */}
          {activePhoto && (
            <img
              src={activePhoto.file_url}
              alt={activePhoto.filename}
              className="relative z-10 max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {/* Nav */}
          <NavBar index={activeIndex} onPrev={goPrev} onNext={goNext} />
        </div>,
        document.body
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-80 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-2xl flex flex-col gap-4">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete this attachment?</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Newly uploaded photo preview */}
      {!!pendingUrl && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setPendingUrl(null)}
          />
          <img
            src={pendingUrl}
            alt="Uploaded photo"
            className="relative z-10 max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>
  )
}