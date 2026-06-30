import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PhaseUpdateSchema, type PhaseUpdate, type PhaseResponse, type ProjectResponse } from '@/validations/project'
import { useUpdatePhase } from '@/hooks/useProject'
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
  FormMessage,
} from '@/pages/_components/ui/form'
import { Input } from '@/pages/_components/ui/input'
import { Button } from '@/pages/_components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'

interface Props {
  project: ProjectResponse
  phase: PhaseResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditPhaseDialog({ project, phase, open, onOpenChange }: Props) {
  const { mutate: updatePhase, isPending } = useUpdatePhase()

  const form = useForm<PhaseUpdate>({
    resolver: zodResolver(PhaseUpdateSchema),
    defaultValues: {
      name: '',
      allocated_budget: 0,
      status: 'Not Started',
    },
  })

  useEffect(() => {
    if (phase) {
      form.reset({
        name: phase.name,
        allocated_budget: phase.allocated_budget,
        status: phase.status,
      })
    }
  }, [phase, form])

  const onSubmit = (data: PhaseUpdate) => {
    if (!phase) return

    const hasChanges =
      data.name !== phase.name ||
      data.allocated_budget !== phase.allocated_budget ||
      data.status !== phase.status

    if (!hasChanges) {
      toast.error('• Nothing to update.')
      return
    }

    updatePhase(
      { projectId: project.id, phaseId: phase.id, data },
      {
        onSuccess: () => {
          toast.success('Phase updated successfully')
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update phase'
          toast.error(message)
        },
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Phase</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Foundation, Structure, Finishing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allocated_budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocated Budget (PHP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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