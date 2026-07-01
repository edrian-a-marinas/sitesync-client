import { useRef } from 'react'
import { useTodayLog } from '@/hooks/useWorker'
import { useGetSitePhotos, useUploadSitePhoto } from '@/hooks/useSitePhoto'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import { ClipboardList, ImagePlus, Cloud } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  projectId: number
}

export default function DailyLogTab({ projectId }: Props) {
  const { data: log, isLoading: logLoading } = useTodayLog(projectId)
  const { data: photos, isLoading: photosLoading } = useGetSitePhotos(
    projectId,
    log?.id ?? 0,
    !!log?.id,
  )
  const uploadMutation = useUploadSitePhoto(projectId, log?.id ?? 0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate(file, {
      onSuccess: () => toast.success('Photo uploaded successfully'),
      onError: () => toast.error('Failed to upload photo'),
    })
    e.target.value = ''
  }

  if (logLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    )
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-zinc-400 dark:text-zinc-500">
        <ClipboardList className="h-10 w-10" />
        <p className="text-sm">No log has been submitted for today yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Daily Log
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Today's site log submitted by your project manager.
        </p>
      </div>

      {/* Log details */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {log.log_date}
          </span>
          {log.weather_condition && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              {log.weather_condition}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Work Accomplished
          </p>
          <p className="text-sm text-zinc-800 dark:text-zinc-200">
            {log.work_accomplished}
          </p>
        </div>

        {log.notes && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Notes
            </p>
            <p className="text-sm text-zinc-800 dark:text-zinc-200">
              {log.notes}
            </p>
          </div>
        )}

        <p className="text-xs text-zinc-400">
          Submitted by {log.submitted_by_name}
        </p>
      </div>

      {/* Site photos */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Site Photos
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <ImagePlus className="mr-1.5 h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {photosLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : !photos || photos.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No photos uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                <img
                  src={photo.file_url}
                  alt={photo.filename}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
