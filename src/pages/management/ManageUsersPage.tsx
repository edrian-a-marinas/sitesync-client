import { useState, useMemo, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/store/auth'
import { ROLES, ROUTES } from '@/constants'
import { useUsers } from '@/hooks/useUser'
import type { UserResponse } from '@/validations/auth'
import type { UsersSearch } from '@/types/user'
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
import { Plus, Search } from 'lucide-react'
import { Input } from '@/pages/_components/ui/input'
import { Button } from '@/pages/_components/ui/button'
import OwnerRegisterForm from './__components/users/RegisterForm'
import EditUserDialog from './__components/users/EditUserDialog'
import { useProjects, useProjectDetail } from '@/hooks/useProject'
import StatusConfirmDialog from './__components/users/StatusConfirmDialog'
import UserAssignmentsModal from './__components/users/UserAssignmentsModal'
import ResetPasswordDialog from './__components/users/ResetPasswordDialog'
import UsersTable from './__components/users/UsersTable'
type RoleFilter = 'all' | 'owner' | 'pm' | 'worker'
type StatusFilter = 'all' | 'active' | 'inactive'

export default function ManageUsersPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [registerOpen, setRegisterOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserResponse | null>(null)
  const [statusTarget, setStatusTarget] = useState<{
    user: UserResponse
    action: 'activate' | 'deactivate'
  } | null>(null)
  const [assignmentsUser, setAssignmentsUser] = useState<UserResponse | null>(
    null,
  )
  const [resetPasswordUser, setResetPasswordUser] =
    useState<UserResponse | null>(null)
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as {
    page?: number
    search?: string
  }
  const page = searchParams.page ?? 1
  const search = searchParams.search ?? ''
  const PAGE_SIZE = 20

  const [projectFilter, setProjectFilter] = useState<number | null>(null)
  const [workerScope, setWorkerScope] = useState<'mine' | 'all'>('mine')
  const { data: activeProjects } = useProjects('Active')
  const { data: selectedProjectDetail } = useProjectDetail(projectFilter)
  const {
    data: usersData,
    isLoading,
    isError,
  } = useUsers(!isOwner ? workerScope : undefined, page, PAGE_SIZE, search)

  const handleSearchChange = useCallback(
    (value: string) => {
      navigate({
        to: ROUTES.MANAGE_USERS,
        search: (prev: Partial<UsersSearch>) => ({
          ...prev,
          search: value,
          page: 1,
        }),
      })
    },
    [navigate],
  )
  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate({
        to: ROUTES.MANAGE_USERS,
        search: (prev: Partial<UsersSearch>) => ({
          ...prev,
          search: prev.search ?? '',
          page: newPage,
        }),
      })
    },
    [navigate],
  )

  const totalPages = usersData
    ? Math.max(1, Math.ceil(usersData.total / usersData.page_size))
    : 1

  const handleEdit = useCallback((u: UserResponse) => {
    setEditUser(u)
  }, [])

  const handleStatusChange = useCallback(
    (u: UserResponse, action: 'activate' | 'deactivate') => {
      setStatusTarget({ user: u, action })
    },
    [],
  )
  const handleResetPassword = useCallback((u: UserResponse) => {
    setResetPasswordUser(u)
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
          const roleDiff =
            (ROLE_ORDER[a.role_id] ?? 99) - (ROLE_ORDER[b.role_id] ?? 99)
          if (roleDiff !== 0) return roleDiff
        }
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [
    usersData,
    roleFilter,
    statusFilter,
    projectFilter,
    selectedProjectDetail,
  ])

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
            onValueChange={(v) =>
              setProjectFilter(v === 'all' ? null : Number(v))
            }
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
            <Select
              value={workerScope}
              onValueChange={(v) => setWorkerScope(v as 'mine' | 'all')}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My Site Workers</SelectItem>
                <SelectItem value="all">All Site Workers</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
          >
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
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
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
            const timeout = setTimeout(
              () => handleSearchChange(e.target.value),
              400,
            )
            return () => clearTimeout(timeout)
          }}
          placeholder="Search name or email..."
          className="pl-8"
        />
      </div>
      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load users. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <UsersTable
        users={filteredUsers}
        isLoading={isLoading}
        currentUserId={user?.id}
        isOwner={isOwner}
        workerScope={workerScope}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onResetPassword={handleResetPassword}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
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
          <OwnerRegisterForm
            onSuccess={() => setRegisterOpen(false)}
            isOwner={isOwner}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditUserDialog
        user={editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null)
        }}
      />

      {/* Status Confirm Dialog */}
      <StatusConfirmDialog
        target={statusTarget}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null)
        }}
      />

      {/* Assignments Modal */}
      <UserAssignmentsModal
        user={assignmentsUser}
        onOpenChange={(open) => {
          if (!open) setAssignmentsUser(null)
        }}
      />
      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={resetPasswordUser}
        onOpenChange={(open) => {
          if (!open) setResetPasswordUser(null)
        }}
      />
    </div>
  )
}
