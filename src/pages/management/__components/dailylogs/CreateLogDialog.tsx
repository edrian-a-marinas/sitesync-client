import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { DailyLogCreateSchema, type DailyLogCreate } from '@/validations/dailyLog'
import { useCreateDailyLog } from '@/hooks/useDailyLog'
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
import { Input } from '@/pages/_components/ui/input'
import { Textarea } from '@/pages/_components/ui/textarea'
import { Button } from '@/pages/_components/ui/button'
import { CalendarIcon, UploadCloud, X, FileText } from 'lucide-react'
import { useRef, useState } from 'react'
import { uploadSitePhoto } from '@/services/sitePhoto'
import { SitePhotoUploadSchema } from '@/validations/sitePhoto'

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Stormy']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  existingDates: string[]
}

export default function CreateLogDialog({ open, onOpenChange, projectId, existingDates }: Props) {
  const { mutate: createLog, isPending } = useCreateDailyLog()
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

  const form = useForm<DailyLogCreate>({
    resolver: zodResolver(DailyLogCreateSchema),
    defaultValues: {
      log_date: '',
      weather_condition: '',
      work_accomplished: '',
      notes: '',
    },
  })

  const errors = form.formState.errors

  const onSubmit = (data: DailyLogCreate) => {
    const today = new Date().toISOString().split('T')[0]
    if (data.log_date > today) {
      toast.error('Log date cannot be in the future')
      return
    }
    if (existingDates.includes(data.log_date)) {
      toast.error('A log already exists for this date')
      return
    }
    createLog(
      { projectId, data },
      {
        onSuccess: async (newLog) => {
          if (fileQueue.length > 0) {
            await Promise.allSettled(
              fileQueue.map((file) =>
                uploadSitePhoto(projectId, newLog.id, file).catch(() =>
                  toast.error(`Failed to upload ${file.name}`)
                )
              )
            )
            toast.success(`Daily log submitted with ${fileQueue.length} attachment(s)`)
          } else {
            toast.success('Daily log submitted successfully')
          }
          form.reset()
          setFileQueue([])
          onOpenChange(false)
        },
        onError: (err: any) => {
          const message = err?.response?.data?.detail ?? 'Failed to submit log'
          toast.error(message)
        },
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setFileQueue([])
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Daily Log</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="log_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date {errors.log_date && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        className="dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        {...field}
                      />
                      <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </FormControl>
                  {errors.log_date && <p className="text-xs text-red-500">Required</p>}
                </FormItem>
              )}
            />
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
                  <FormLabel>Notes <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
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
                {isPending ? 'Submitting...' : 'Submit Log'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}