import { useState } from 'react'
import { useMemo } from 'react'
import { useMyAttendanceHistory } from '@/hooks/useAttendance'
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
import { Button } from '@/pages/_components/ui/button'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { CalendarCheck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { AttendanceHistoryResponse } from '@/types/attendance'

const columnHelper = createColumnHelper<AttendanceHistoryResponse>()

const PAGE_SIZE = 10

interface Props {
  projectId: number
}

export default function AttendanceTable({ projectId }: Props) {
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'log_date', desc: true },
  ])

  const { data, isLoading, isError } = useMyAttendanceHistory(
    projectId,
    page,
    PAGE_SIZE,
    true,
  )

  const rows = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const columns = useMemo(
    () => [
      columnHelper.accessor('log_date', {
        header: 'Date',
        cell: (info) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('hours_worked', {
        header: 'Hours Worked',
        cell: (info) => (
          <span className="text-zinc-700 dark:text-zinc-300">
            {info.getValue()}h
          </span>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 2 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        ))}
      </TableRow>
    ))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          My Attendance
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your shift attendance history for this project.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load attendance history. Please try again.
          </AlertDescription>
        </Alert>
      )}

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
                <TableCell colSpan={2} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <CalendarCheck className="h-8 w-8" />
                    <p className="text-sm">No attendance records yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
