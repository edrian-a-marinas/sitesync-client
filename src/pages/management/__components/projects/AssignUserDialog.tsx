import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { UserResponse } from '@/types/auth'
import { AssignUserRequestSchema, type AssignUserRequest, type ProjectResponse } from '@/validations/project'
import { useAssignManager, useAssignWorker } from '@/hooks/useProject'
import { useUsers, useUsersByRole } from '@/hooks/useUser'
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
import { Input } from '@/pages/_components/ui/input'

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

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Managers: use existing role-filtered hook (PM list is small)
  // Workers: use all site workers system-wide with has_assignments flag
  const { data: managers, isLoading: loadingManagers } = useUsersByRole(ROLES.PROJECT_MANAGER)
  const { data: allWorkersData, isLoading: loadingWorkers } = useUsers('all', 1, 100)

  const isLoading = isManager ? loadingManagers : loadingWorkers

  const rawUsers = isManager
    ? (managers ?? [])
    : (allWorkersData?.items ?? []).filter((u: UserResponse) => u.role_id === ROLES.SITE_WORKER)

  const filteredUsers = rawUsers
    .filter((u) => !excludeUserIds.includes(u.id))
    .filter((u) => {
      const full = `${u.first_name} ${u.last_name}`.toLowerCase()
      return full.includes(search.toLowerCase())
    })

  const form = useForm<AssignUserRequest>({
    resolver: zodResolver(AssignUserRequestSchema),
    defaultValues: { user_id: 0 },
  })

  const onSubmit = (data: AssignUserRequest) => {
    const mutate = isManager ? assignManager : assignWorker
    mutate(
      { projectId: project.id, data },
      {
        onSuccess: () => {
          toast.success(isManager ? 'Manager assigned successfully' : 'Worker assigned successfully')
          handleOpenChange(false)
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

  const handleSelect = (id: number) => {
    setSelectedId(id)
    form.setValue('user_id', id)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setSearch('')
      setSelectedId(null)
    }
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
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{project.name}</span>.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="user_id"
              render={() => (
                <FormItem>
                  <FormLabel>{isManager ? 'Project Manager' : 'Site Worker'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Search ${isManager ? 'manager' : 'worker'} by name...`}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setSelectedId(null)
                        form.setValue('user_id', 0)
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Results list */}
                  {isFocused && (
                    <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                      {isLoading ? (
                        <p className="px-3 py-2 text-sm text-zinc-400">Loading...</p>
                      ) : (() => {
                        const isDefault = search.length === 0 && !isManager
                        const listUsers = isDefault
                          ? filteredUsers.filter((u) => !u.has_assignments).slice(0, 10)
                          : filteredUsers
                        return listUsers.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-zinc-400">
                            {isDefault ? 'All workers are already assigned.' : 'No results found.'}
                          </p>
                        ) : (
                          <>
                            {isDefault && (
                              <p className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                                Not yet assigned to any project
                              </p>
                            )}
                            {listUsers.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                handleSelect(u.id)
                                setSearch(`${u.first_name} ${u.last_name}`)
                                setIsFocused(false)
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                                selectedId === u.id ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                              }`}
                            >
                              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {u.first_name} {u.last_name}
                              </span>
                              {!isManager && !u.has_assignments && search.length > 0 && (
                                <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                                  (not yet assigned to any project)
                                </span>
                              )}
                            </button>
                          ))}
                          </>
                        )
                      })()}
                    </div>
                  )}
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
              <Button type="submit" disabled={isPending || !selectedId}>
                {isPending ? 'Assigning...' : isManager ? 'Assign Manager' : 'Assign Worker'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}