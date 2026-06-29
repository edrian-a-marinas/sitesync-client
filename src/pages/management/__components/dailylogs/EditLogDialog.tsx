import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { DailyLogUpdateSchema, type DailyLogUpdate } from '@/validations/dailyLog'
import type { DailyLogResponse } from '@/types/dailyLog'
import { useUpdateDailyLog } from '@/hooks/useDailyLog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/pages/_components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/pages/_components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'
import { Textarea } from '@/pages/_components/ui/textarea'
import { Button } from '@/pages/_components/ui/button'
import { UploadCloud, X, FileText } from 'lucide-react'
import { useUploadSitePhoto } from '@/hooks/useSitePhoto'
import { useQueryClient } from '@tanstack/react-query'
import { SitePhotoUploadSchema } from '@/validations/sitePhoto'

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Stormy']

interface Props {
  log: DailyLogResponse | null
  projectId: number
  onOpenChange: (open: boolean) => void
}

export default function EditLogDialog({ log, projectId, onOpenChange }: Props) {
  const { mutate: updateLog, isPending } = useUpdateDailyLog()
  const { mutate: uploadPhoto } = useUploadSitePhoto(log?.project_id ?? 0, log?.id ?? 0)
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileQueue, setFileQueue] = useState<File[]>([])

  const handleFileQueue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid: File[] = []
    for (const file of files) {
      if (fileQueue.length + valid.length >= 10) {
        toast.error('Maximum of 10 attachments per log.')
        break
      }
      const result = SitePhotoUploadSchema.safeParse({ file })
      if (!result.success) {
        toast.error(`${file.name}: ${result.error.issues[0].message}`)
        continue
      }
      valid.push(file)
    }
    setFileQueue((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  const removeFromQueue = (index: number) => {
    setFileQueue((prev) => prev.filter((_, i) => i !== index))
  }

  const form = useForm<DailyLogUpdate>({
    resolver: zodResolver(DailyLogUpdateSchema),
    defaultValues: {
      weather_condition: '',
      work_accomplished: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (log) {
      form.reset({
        weather_condition: log.weather_condition ?? '',
        work_accomplished: log.work_accomplished,
        notes: log.notes ?? '',
      })
    }
  }, [log, form])

  const onSubmit = (data: DailyLogUpdate) => {
    if (!log) return

    const hasChanges =
      data.weather_condition !== (log.weather_condition ?? '') ||
      data.work_accomplished !== log.work_accomplished ||
      data.notes !== (log.notes ?? '') ||
      fileQueue.length > 0
    if (!hasChanges) {
      toast.error('Nothing to update.')
      return
    }

    updateLog(
      { projectId, logId: log.id, data },
      {
        onSuccess: () => {
          if (fileQueue.length > 0) {
            fileQueue.forEach((file) =>
              uploadPhoto(file, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['site-photos', log!.project_id, log!.id] })
                },
                onError: () => toast.error(`Failed to upload ${file.name}`),
              })
            )
            toast.success(`Log updated with ${fileQueue.length} attachment(s)`)
          } else {
            toast.success('Daily log updated successfully')
          }
          setFileQueue([])
          onOpenChange(false)
        },
        onError: (err: any) => {
          const message = err?.response?.data?.detail ?? 'Failed to update log'
          toast.error(message)
        },
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setTimeout(() => form.reset(), 200)
      setFileQueue([])
    }
  }

  const errors = form.formState.errors

  return (
    <Dialog open={!!log} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Log —{' '}
            <span className="text-zinc-400 dark:text-zinc-500 font-normal">{log?.log_date}</span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="weather_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WEATHER_OPTIONS.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="work_accomplished"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Work Accomplished {errors.work_accomplished && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work done during this shift..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  {errors.work_accomplished && <p className="text-xs text-red-500">Required</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes or observations..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* Optional attachments */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Attachments <span className="text-zinc-400 text-xs">(optional, max 10)</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  disabled={fileQueue.length >= 10}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Add File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileQueue}
                />
              </div>
              {fileQueue.length > 0 && (
                <ul className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {fileQueue.map((file, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} className="h-6 w-6 rounded object-cover" alt={file.name} />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFromQueue(i)} className="ml-2 shrink-0 text-zinc-400 hover:text-red-500 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}