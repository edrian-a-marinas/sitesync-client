import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AssignUserRequestSchema, type AssignUserRequest, type ProjectResponse } from '@/validations/project'
import { useAssignManager, useAssignWorker } from '@/hooks/useProject'
import { useUsersByRole } from '@/hooks/useUser'
import { ROLES } from '@/constants'
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
  type: 'manager' | 'worker'
  open: boolean
  onOpenChange: (open: boolean) => void
  excludeUserIds?: number[]
}

export default function AssignUserDialog({ project, type, open, onOpenChange, excludeUserIds = [] }: Props) {
  const { mutate: assignManager, isPending: assigningManager } = useAssignManager()
  const { mutate: assignWorker, isPending: assigningWorker } = useAssignWorker()
  const isPending = assigningManager || assigningWorker
  const isManager = type === 'manager'
  const roleId = isManager ? ROLES.PROJECT_MANAGER : ROLES.SITE_WORKER
  const { data: users, isLoading: loadingUsers } = useUsersByRole(roleId)
  const filteredUsers = users?.filter((u) => !excludeUserIds.includes(u.id)) ?? []
  const form = useForm<AssignUserRequest>({
    resolver: zodResolver(AssignUserRequestSchema),
    defaultValues: {
      user_id: 0,
    },
  })

  const onSubmit = (data: AssignUserRequest) => {

    const mutate = isManager ? assignManager : assignWorker

    mutate(
      { projectId: project.id, data },
      {
        onSuccess: () => {
          toast.success(isManager ? 'Manager assigned successfully' : 'Worker assigned successfully')
          form.reset()
          onOpenChange(false)
        },
        onError: (err: any) => {
          const message = err?.response?.data?.detail ?? (isManager
            ? 'Failed to assign manager'
            : 'Failed to assign worker')
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isManager ? 'Assign Project Manager' : 'Assign Site Worker'}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Assigning to{' '}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{project.name}</span>.{' '}
          {isManager
            ? 'Only users with the Project Manager role can be assigned.'
            : 'Only users with the Site Worker role can be assigned.'}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isManager ? 'Project Manager' : 'Site Worker'}</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ''}
                    disabled={loadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingUsers ? 'Loading...' : `Select ${isManager ? 'a manager' : 'a worker'}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUsers.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.first_name} {u.last_name}
                        </SelectItem>
                      ))}
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
                {isPending ? 'Assigning...' : isManager ? 'Assign Manager' : 'Assign Worker'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}