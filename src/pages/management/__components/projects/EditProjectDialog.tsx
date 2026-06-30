import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  ProjectUpdateSchema,
  type ProjectUpdate,
  type ProjectResponse,
} from '@/validations/project'
import { useUpdateProject } from '@/hooks/useProject'
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
import { Input } from '@/pages/_components/ui/input'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/pages/_components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'

interface Props {
  project: ProjectResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: Props) {
  const { mutate: updateProject, isPending } = useUpdateProject()

  const form = useForm<ProjectUpdate>({
    resolver: zodResolver(ProjectUpdateSchema),
    defaultValues: {
      name: '',
      location: '',
      total_budget: 0,
      start_date: '',
      target_end_date: '',
      status: 'Active',
    },
  })

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        location: project.location,
        total_budget: project.total_budget,
        start_date: project.start_date,
        target_end_date: project.target_end_date,
        status: project.status,
      })
    }
  }, [project, form])

  const onSubmit = (data: ProjectUpdate) => {
    if (!project) return

    const hasChanges =
      data.name !== project.name ||
      data.location !== project.location ||
      data.total_budget !== project.total_budget ||
      data.start_date !== project.start_date ||
      data.target_end_date !== project.target_end_date ||
      data.status !== project.status

    if (!hasChanges) {
      toast.error('• Nothing to update.')
      return
    }
    updateProject(
      { projectId: project.id, data },
      {
        onSuccess: () => {
          toast.success('Project updated successfully')
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ?? 'Failed to update project'
          toast.error(message)
        },
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project Name{' '}
                    {errors.name && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Makati Residential Tower"
                      {...field}
                    />
                  </FormControl>
                  {errors.name && (
                    <p className="text-xs text-red-500">Required</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Location{' '}
                    {errors.location && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Makati City, Metro Manila"
                      {...field}
                    />
                  </FormControl>
                  {errors.location && (
                    <p className="text-xs text-red-500">Required</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Total Budget (PHP){' '}
                    {errors.total_budget && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0.00"
                      {...field}
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const val = e.target.value
                        const [, decimal] = val.split('.')
                        if (decimal !== undefined && decimal.length > 2) return
                        field.onChange(val === '' ? 0 : Number(val))
                      }}
                    />
                  </FormControl>
                  {errors.total_budget && (
                    <p className="text-xs text-red-500">
                      {errors.total_budget.type === 'too_big'
                        ? 'Budget exceeds maximum allowed value'
                        : 'Required'}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date{' '}
                      {errors.start_date && (
                        <span className="text-red-500">*</span>
                      )}
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
                    {errors.start_date && (
                      <p className="text-xs text-red-500">Required</p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Target End Date{' '}
                      {errors.target_end_date && (
                        <span className="text-red-500">*</span>
                      )}
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
                    {errors.target_end_date && (
                      <p className="text-xs text-red-500">Required</p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
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
