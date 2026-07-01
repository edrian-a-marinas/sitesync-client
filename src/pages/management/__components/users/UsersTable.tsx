import { useState } from 'react'
import { ROLES, ROLE_LABEL } from '@/constants'
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
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import UserActionsDropdown from './UserActionsDropdown'

const ROLE_BADGE: Record<number, string> = {
  [ROLES.OWNER]:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [ROLES.PROJECT_MANAGER]:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [ROLES.SITE_WORKER]:
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

const columnHelper = createColumnHelper<UserResponse>()

interface Props {
  users: UserResponse[]
  isLoading: boolean
  currentUserId: number | undefined
  isOwner: boolean
  workerScope: 'mine' | 'all'
  onEdit: (u: UserResponse) => void
  onStatusChange: (u: UserResponse, action: 'activate' | 'deactivate') => void
  onResetPassword: (u: UserResponse) => void
  onRowClick: (u: UserResponse) => void
}

export default function UsersTable({
  users,
  isLoading,
  currentUserId,
  isOwner,
  workerScope,
  onEdit,
  onStatusChange,
  onResetPassword,
  onRowClick,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'name',
      header: 'Name',
      cell: (info) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">
          {info.getValue()}
        </span>
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
            currentUserId={currentUserId}
            isOwner={isOwner}
            canChangeStatus={isOwner || workerScope === 'mine'}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onResetPassword={onResetPassword}
          />
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: users,
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
          <TableCell key={j}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        ))}
      </TableRow>
    ))

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={
                    header.column.getCanSort()
                      ? 'cursor-pointer select-none'
                      : ''
                  }
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getCanSort() &&
                      (header.column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      ))}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            renderSkeletonRows()
          ) : table.getRowModel().rows.length === 0 ? (
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
                  onClick={() => onRowClick(row.original)}
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
  )
}