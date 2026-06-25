import { useState, useMemo } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useUsers, useActivateUser, useDeactivateUser, useUpdateUser } from '@/hooks/useUser'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserUpdateSchema, type UserUpdateInput, type UserResponse } from '@/validations/auth'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/pages/_components/ui/table'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/pages/_components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/pages/_components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/pages/_components/ui/form'
import { Input } from '@/pages/_components/ui/input'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { MoreHorizontal, Plus, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import OwnerRegisterForm from './__components/owner/RegisterForm'

// --- Used in ManageUsersPage ---
const ROLE_LABEL: Record<number, string> = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
  [ROLES.SITE_WORKER]: 'Site Worker',
}

const ROLE_BADGE: Record<number, string> = {
  [ROLES.OWNER]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [ROLES.PROJECT_MANAGER]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [ROLES.SITE_WORKER]: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

type RoleFilter = 'all' | 'owner' | 'pm' | 'worker'
type StatusFilter = 'all' | 'active' | 'inactive'

const columnHelper = createColumnHelper<UserResponse>()

export default function ManageUsersPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [registerOpen, setRegisterOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserResponse | null>(null)
  const [statusTarget, setStatusTarget] = useState<{ user: UserResponse; action: 'activate' | 'deactivate' } | null>(null)

  const { data: users, isLoading, isError } = useUsers()
  const activateUser = useActivateUser()
  const deactivateUser = useDeactivateUser()
  const updateUser = useUpdateUser()

  const editForm = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      phone_number: '',
    },
  })

  const handleEditOpen = (u: UserResponse) => {
    editForm.reset({
      first_name: u.first_name,
      last_name: u.last_name,
      middle_name: '',
      phone_number: '',
    })
    setEditUser(u)
  }

  const handleEditSubmit = async (data: UserUpdateInput) => {
    if (!editUser) return
    try {
      await updateUser.mutateAsync({ userId: editUser.id, data })
      toast.success('User updated successfully.')
      setEditUser(null)
    } catch (err) {
      console.error('[ManageUsersPage] edit error:', err)
      toast.error('Failed to update user.')
    }
  }

  const handleStatusConfirm = async () => {
    if (!statusTarget) return
    try {
      if (statusTarget.action === 'activate') {
        await activateUser.mutateAsync(statusTarget.user.id)
        toast.success(`${statusTarget.user.first_name} activated.`)
      } else {
        await deactivateUser.mutateAsync(statusTarget.user.id)
        toast.success(`${statusTarget.user.first_name} deactivated.`)
      }
      setStatusTarget(null)
    } catch (err) {
      console.error('[ManageUsersPage] status error:', err)
      toast.error('Failed to update user status.')
    }
  }

  const filteredUsers = (users ?? []).filter((u) => {
    const roleMatch =
      roleFilter === 'all' ||
      (roleFilter === 'owner' && u.role_id === ROLES.OWNER) ||
      (roleFilter === 'pm' && u.role_id === ROLES.PROJECT_MANAGER) ||
      (roleFilter === 'worker' && u.role_id === ROLES.SITE_WORKER)

    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'inactive' && !u.is_active)

    return roleMatch && statusMatch
  })

  const columns = useMemo(() => [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'name',
      header: 'Name',
      cell: (info) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('role_id', {
      header: 'Role',
      cell: (info) => (
        <Badge
          className={`text-xs font-medium ${ROLE_BADGE[info.getValue()] ?? 'bg-zinc-100 text-zinc-600'}`}
          variant="outline"
        >
          {ROLE_LABEL[info.getValue()] ?? 'Unknown'}
        </Badge>
      ),
    }),
    columnHelper.accessor('is_active', {
      header: 'Status',
      cell: (info) => (
        <Badge
          className={
            info.getValue()
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }
          variant="outline"
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const u = row.original
        const isSelf = u.id === user?.id
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditOpen(u)}>
                  Edit
                </DropdownMenuItem>
                {isOwner && !isSelf && (
                  u.is_active ? (
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => setStatusTarget({ user: u, action: 'deactivate' })}
                    >
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="text-emerald-600 dark:text-emerald-400"
                      onClick={() => setStatusTarget({ user: u, action: 'activate' })}
                    >
                      Activate
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ], [isOwner, user?.id, editForm])
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 5 }).map((__, j) => (
          <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
        ))}
      </TableRow>
    ))

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Manage Users{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              — {isOwner ? 'Owner' : 'PM'} View
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOwner
              ? 'Register and manage all PM and Worker accounts'
              : 'Register and manage Worker accounts for your projects'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="pm">Project Manager</SelectItem>
              <SelectItem value="worker">Site Worker</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setRegisterOpen(true)} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New User
          </Button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load users. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? renderSkeletonRows() : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <Users className="h-8 w-8" />
                    <p className="text-sm">No users found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Register Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New User</DialogTitle>
          </DialogHeader>
          <OwnerRegisterForm onSuccess={() => setRegisterOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit User — {editUser?.first_name} {editUser?.last_name}
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="+63 912 345 6789" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateUser.isPending} className="mt-2 w-full">
                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Activate / Deactivate Confirm */}
      <AlertDialog open={!!statusTarget} onOpenChange={(open) => { if (!open) setStatusTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.action === 'deactivate' ? 'Deactivate' : 'Activate'} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.action === 'deactivate'
                ? `This will prevent ${statusTarget?.user.first_name} from logging in. You can reactivate them anytime.`
                : `This will restore ${statusTarget?.user.first_name}'s access to the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={
                statusTarget?.action === 'deactivate'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              {statusTarget?.action === 'deactivate' ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}