import { useEffect } from 'react'
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

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Stormy']

interface Props {
  log: DailyLogResponse | null
  projectId: number
  onOpenChange: (open: boolean) => void
}

export default function EditLogDialog({ log, projectId, onOpenChange }: Props) {
  const { mutate: updateLog, isPending } = useUpdateDailyLog()

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
      data.notes !== (log.notes ?? '')

    if (!hasChanges) {
      toast.error('Nothing to update.')
      return
    }

    updateLog(
      { projectId, logId: log.id, data },
      {
        onSuccess: () => {
          toast.success('Daily log updated successfully')
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
    if (!open) form.reset()
    onOpenChange(open)
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