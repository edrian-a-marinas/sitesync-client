import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  DailyLogUpdateSchema,
  type DailyLogUpdate,
} from '@/validations/dailyLog'
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
import { Textarea } from '@/pages/_components/ui/textarea'
import { Button } from '@/pages/_components/ui/button'
import { UploadCloud, X, FileText, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/pages/_components/ui/tooltip'
import { useGetSitePhotos, useUploadSitePhoto } from '@/hooks/useSitePhoto'
import { useQueryClient } from '@tanstack/react-query'
import { SitePhotoUploadSchema } from '@/validations/sitePhoto'
import { createMaterial } from '@/services/material'
import {
  MaterialCreateSchema,
  type MaterialCreate,
} from '@/validations/material'
import { Input } from '@/pages/_components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'

const WEATHER_OPTIONS = ['Sunny', 'Cloudy', 'Rainy', 'Stormy']
const UNIT_OPTIONS = [
  'pc',
  'bd.ft',
  'kg',
  'ton',
  'bag',
  'm',
  'sq.m',
  'cu.m',
  'L',
  'gal',
  'roll',
  'box',
  'sack',
  'set',
  'lot',
  'sheet',
]
const emptyMaterialForm = { name: '', quantity: '', unit: '', unit_cost: '' }

interface Props {
  log: DailyLogResponse | null
  projectId: number
  onOpenChange: (open: boolean) => void
}

export default function EditLogDialog({ log, projectId, onOpenChange }: Props) {
  const { mutate: updateLog, isPending } = useUpdateDailyLog()
  const { mutate: uploadPhoto } = useUploadSitePhoto(
    log?.project_id ?? 0,
    log?.id ?? 0,
  )
  const { data: existingPhotos } = useGetSitePhotos(
    log?.project_id ?? 0,
    log?.id ?? 0,
    !!log,
  )
  const existingCount = existingPhotos?.length ?? 0
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileQueue, setFileQueue] = useState<File[]>([])
  const [materialQueue, setMaterialQueue] = useState<MaterialCreate[]>([])
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [materialForm, setMaterialForm] = useState(emptyMaterialForm)
  const totalCount = existingCount + fileQueue.length

  const handleFileQueue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid: File[] = []
    for (const file of files) {
      if (totalCount + valid.length >= 10) {
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
  const addMaterialToQueue = () => {
    const payload = {
      name: materialForm.name,
      quantity: Number(materialForm.quantity),
      unit: materialForm.unit,
      unit_cost: Number(materialForm.unit_cost),
    }
    const result = MaterialCreateSchema.safeParse(payload)
    if (!result.success) {
      toast.error('Please fill in all material fields correctly.')
      return
    }
    setMaterialQueue((prev) => [...prev, result.data])
    setMaterialForm(emptyMaterialForm)
    setShowMaterialForm(false)
  }
  const removeMaterialFromQueue = (index: number) => {
    setMaterialQueue((prev) => prev.filter((_, i) => i !== index))
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
    if (
      showMaterialForm &&
      (materialForm.name ||
        materialForm.quantity ||
        materialForm.unit ||
        materialForm.unit_cost)
    ) {
      toast.error('Please finish or cancel the material you are adding.')
      return
    }

    const hasChanges =
      data.weather_condition !== (log.weather_condition ?? '') ||
      data.work_accomplished !== log.work_accomplished ||
      data.notes !== (log.notes ?? '') ||
      fileQueue.length > 0 ||
      materialQueue.length > 0
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
                  queryClient.invalidateQueries({
                    queryKey: ['site-photos', log!.project_id, log!.id],
                  })
                },
                onError: () => toast.error(`Failed to upload ${file.name}`),
              }),
            )
          }
          if (materialQueue.length > 0) {
            Promise.allSettled(
              materialQueue.map((material) =>
                createMaterial(log!.project_id, log!.id, material).catch(() =>
                  toast.error(`Failed to add material: ${material.name}`),
                ),
              ),
            ).then(() => {
              queryClient.invalidateQueries({
                queryKey: ['materials', log!.project_id, log!.id],
              })
            })
          }
          const parts: string[] = []
          if (fileQueue.length > 0)
            parts.push(`${fileQueue.length} attachment(s)`)
          if (materialQueue.length > 0)
            parts.push(`${materialQueue.length} material(s)`)
          toast.success(
            parts.length > 0
              ? `Log updated with ${parts.join(' and ')}`
              : 'Daily log updated successfully',
          )
          setFileQueue([])
          setMaterialQueue([])
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ?? 'Failed to update log'
          toast.error(message)
        },
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setTimeout(() => form.reset(), 200)
      setFileQueue([])
      setMaterialQueue([])
      setMaterialForm(emptyMaterialForm)
      setShowMaterialForm(false)
    }
  }

  const errors = form.formState.errors

  return (
    <Dialog open={!!log} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Log —{' '}
            <span className="text-zinc-400 dark:text-zinc-500 font-normal">
              {log?.log_date}
            </span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
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
                    Work Accomplished{' '}
                    {errors.work_accomplished && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work done during this shift..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  {errors.work_accomplished && (
                    <p className="text-xs text-red-500">Required</p>
                  )}
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
            {/* Optional materials */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Materials{' '}
                  <span className="text-zinc-400 text-xs">(optional)</span>
                </span>
                {!showMaterialForm && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => setShowMaterialForm(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Material
                  </Button>
                )}
              </div>
              {materialQueue.length > 0 && (
                <ul className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {materialQueue.map((material, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      <span className="truncate">
                        {material.name} — {material.quantity} {material.unit} ×
                        ₱{material.unit_cost}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMaterialFromQueue(i)}
                        className="ml-2 shrink-0 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {showMaterialForm && (
                <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">
                      New Material
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMaterialForm(false)
                        setMaterialForm(emptyMaterialForm)
                      }}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Material Name
                    </label>
                    <Input
                      placeholder="e.g. Lumber"
                      value={materialForm.name}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400">
                        Quantity
                      </label>
                      <Input
                        placeholder="0"
                        type="number"
                        value={materialForm.quantity}
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400">
                        Unit
                      </label>
                      <Select
                        value={materialForm.unit}
                        onValueChange={(value) =>
                          setMaterialForm({ ...materialForm, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400">
                        Unit Cost (₱)
                      </label>
                      <Input
                        placeholder="0.00"
                        type="number"
                        value={materialForm.unit_cost}
                        onChange={(e) =>
                          setMaterialForm({
                            ...materialForm,
                            unit_cost: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={addMaterialToQueue}
                  >
                    Add to List
                  </Button>
                </div>
              )}
            </div>
            {/* Optional attachments */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Attachments{' '}
                  <span className="text-zinc-400 text-xs">
                    ({totalCount}/10)
                  </span>
                </span>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={totalCount >= 10 ? 'cursor-not-allowed' : ''}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs"
                          disabled={totalCount >= 10}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                          Add File
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {totalCount >= 10 && (
                      <TooltipContent>
                        <p>
                          Max attachments reached. To add more, delete existing
                          ones from the log detail.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
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
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            className="h-6 w-6 rounded object-cover"
                            alt={file.name}
                          />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(i)}
                        className="ml-2 shrink-0 text-zinc-400 hover:text-red-500 transition-colors"
                      >
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
