import { useState, useMemo, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth'
import { ROLES, ROLE_LABEL, ROUTES } from '@/constants'
import { useUsers } from '@/hooks/useUser'
import type { UserResponse } from '@/validations/auth'
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
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Plus, Users, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { Input } from '@/pages/_components/ui/input'
import OwnerRegisterForm from './__components/users/RegisterForm'
import EditUserDialog from './__components/users/EditUserDialog'
import { useProjects, useProjectDetail } from '@/hooks/useProject'
import StatusConfirmDialog from './__components/users/StatusConfirmDialog'
import UserActionsDropdown from './__components/users/UserActionsDropdown'
import UserAssignmentsModal from './__components/users/UserAssignmentsModal'

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [sorting, setSorting] = useState<SortingState>([])
  const [registerOpen, setRegisterOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserResponse | null>(null)
  const [statusTarget, setStatusTarget] = useState<{ user: UserResponse; action: 'activate' | 'deactivate' } | null>(null)
  const [assignmentsUser, setAssignmentsUser] = useState<UserResponse | null>(null)
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { page?: number; search?: string }
  const page = searchParams.page ?? 1
  const search = searchParams.search ?? ''
  const PAGE_SIZE = 20

  const [projectFilter, setProjectFilter] = useState<number | null>(null)
  const [workerScope, setWorkerScope] = useState<'mine' | 'all'>('mine')
  const { data: activeProjects } = useProjects('Active')
  const { data: selectedProjectDetail } = useProjectDetail(projectFilter)
  const { data: usersData, isLoading, isError } = useUsers(!isOwner ? workerScope : undefined, page, PAGE_SIZE, search)

  const handleSearchChange = useCallback((value: string) => {
    navigate({
      to: ROUTES.MANAGE_USERS,
      search: (prev: any) => ({ ...prev, search: value, page: 1 }),
    })
  }, [navigate])

  const handlePageChange = useCallback((newPage: number) => {
    navigate({
      to: ROUTES.MANAGE_USERS,
      search: (prev: any) => ({ ...prev, page: newPage }),
    })
  }, [navigate])

  const totalPages = usersData ? Math.max(1, Math.ceil(usersData.total / usersData.page_size)) : 1

  const handleEdit = useCallback((u: UserResponse) => {
    setEditUser(u)
  }, [])

  const handleStatusChange = useCallback((u: UserResponse, action: 'activate' | 'deactivate') => {
    setStatusTarget({ user: u, action })
  }, [])

  const handleRowClick = useCallback((u: UserResponse) => {
    // Owners have no project assignments — skip modal for them
    if (u.role_id === ROLES.OWNER) return
    setAssignmentsUser(u)
  }, [])

  const filteredUsers = useMemo(() => {
    const ROLE_ORDER: Record<number, number> = {
      [ROLES.OWNER]: 0,
      [ROLES.PROJECT_MANAGER]: 1,
      [ROLES.SITE_WORKER]: 2,
    }
    return (usersData?.items ?? [])
      .filter((u) => {
        const roleMatch =
          roleFilter === 'all' ||
          (roleFilter === 'owner' && u.role_id === ROLES.OWNER) ||
          (roleFilter === 'pm' && u.role_id === ROLES.PROJECT_MANAGER) ||
          (roleFilter === 'worker' && u.role_id === ROLES.SITE_WORKER)
        const statusMatch =
          statusFilter === 'all' ||
          (statusFilter === 'active' && u.is_active) ||
          (statusFilter === 'inactive' && !u.is_active)
        const projectMatch = (() => {
          if (!projectFilter || !selectedProjectDetail) return true
          const memberIds = new Set([
            ...(selectedProjectDetail.managers ?? []).map((m) => m.id),
            ...(selectedProjectDetail.workers ?? []).map((w) => w.id),
          ])
          return memberIds.has(u.id)
        })()
        return roleMatch && statusMatch && projectMatch
      })
      .sort((a, b) => {
        if (roleFilter === 'all') {
          const roleDiff = (ROLE_ORDER[a.role_id] ?? 99) - (ROLE_ORDER[b.role_id] ?? 99)
          if (roleDiff !== 0) return roleDiff
        }
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [usersData, roleFilter, statusFilter, projectFilter, selectedProjectDetail])

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
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <UserActionsDropdown
            user={row.original}
            currentUserId={user?.id}
            isOwner={isOwner}
            canChangeStatus={isOwner || workerScope === 'mine'}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
          />
        </div>
      ),
    }),
  ], [isOwner, user?.id, workerScope, handleEdit, handleStatusChange])

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
          <Select
            value={projectFilter !== null ? String(projectFilter) : 'all'}
            onValueChange={(v) => setProjectFilter(v === 'all' ? null : Number(v))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {(activeProjects ?? []).map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isOwner && (
            <Select value={workerScope} onValueChange={(v) => setWorkerScope(v as 'mine' | 'all')}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My Site Workers</SelectItem>
                <SelectItem value="all">All Site Workers</SelectItem>
              </SelectContent>
            </Select>
          )}
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
              <SelectValue placeholder="Active" />
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

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
        <Input
          defaultValue={search}
          onChange={(e) => {
            const timeout = setTimeout(() => handleSearchChange(e.target.value), 400)
            return () => clearTimeout(timeout)
          }}
          placeholder="Search name or email..."
          className="pl-8"
        />
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
              table.getRowModel().rows.map((row) => {
                const isClickable = row.original.role_id !== ROLES.OWNER
                return (
                  <TableRow
                    key={row.id}
                    className={`transition-colors ${isClickable ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30' : ''}`}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
      {/* Register Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New User</DialogTitle>
          </DialogHeader>
          <OwnerRegisterForm onSuccess={() => setRegisterOpen(false)} isOwner={isOwner} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditUserDialog
        user={editUser}
        onOpenChange={(open) => { if (!open) setEditUser(null) }}
      />

      {/* Status Confirm Dialog */}
      <StatusConfirmDialog
        target={statusTarget}
        onOpenChange={(open) => { if (!open) setStatusTarget(null) }}
      />

      {/* Assignments Modal */}
      <UserAssignmentsModal
        user={assignmentsUser}
        onOpenChange={(open) => { if (!open) setAssignmentsUser(null) }}
      />
    </div>
  )
}