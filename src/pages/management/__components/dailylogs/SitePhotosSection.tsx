import { useRef, useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useGetSitePhotos, useUploadSitePhoto } from '@/hooks/useSitePhoto'
import { SitePhotoUploadSchema } from '@/validations/sitePhoto'
import { Button } from '@/pages/_components/ui/button'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Dialog } from '@/pages/_components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ImageIcon, UploadCloud, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react'
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
              <button
                key={photo.id}
                onClick={() => setActiveIndex(index)}
                className="h-24 w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img
                  src={photo.file_url}
                  alt={photo.filename}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <a
                key={photo.id}
                href={photo.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-24 w-full items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors gap-1.5"
              >
                <FileText className="h-4 w-4" />
                {photo.filename}
              </a>
            )
          )}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={activeIndex !== null} onOpenChange={(open) => { if (!open) setActiveIndex(null) }} modal={false}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 pointer-events-auto" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none flex flex-col items-center gap-4">
            <DialogPrimitive.Title className="sr-only">
              Site photo {(activeIndex ?? 0) + 1} of {total}
            </DialogPrimitive.Title>
            {activePhoto && (
              <>
                <img
                  src={activePhoto.file_url}
                  alt={activePhoto.filename}
                  className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                />
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goPrev}
                    disabled={activeIndex === 0}
                    className="text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-sm text-zinc-300">
                    {(activeIndex ?? 0) + 1} of {total}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goNext}
                    disabled={activeIndex === total - 1}
                    className="text-zinc-300 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
            <DialogPrimitive.Close className="absolute right-4 top-4 text-zinc-400 hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>

    {/* Newly uploaded photo preview */}
    <Dialog open={!!pendingUrl} onOpenChange={(open) => { if (!open) setPendingUrl(null) }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 pointer-events-auto" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none flex flex-col items-center gap-4">
          <DialogPrimitive.Title className="sr-only">Uploaded photo preview</DialogPrimitive.Title>
          {pendingUrl && (
            <img
              src={pendingUrl}
              alt="Uploaded photo"
              className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          )}
          <DialogPrimitive.Close className="absolute right-4 top-4 text-zinc-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
    </div>
  )
}