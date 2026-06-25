import { useMemo, useState } from 'react'
import type { DailyLogResponse } from '@/types/dailyLog'
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
import { ClipboardList, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

const WEATHER_BADGE: Record<string, string> = {
  Sunny: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cloudy: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  Rainy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Stormy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const columnHelper = createColumnHelper<DailyLogResponse>()

interface Props {
  logs: DailyLogResponse[]
  isLoading: boolean
  selectedLog: DailyLogResponse | null
  onSelectLog: (log: DailyLogResponse) => void
  onEditLog: (log: DailyLogResponse) => void
}

export default function DailyLogTable({ logs, isLoading, selectedLog, onSelectLog, onEditLog }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo(() => [
    columnHelper.accessor('log_date', {
      header: 'Date',
      cell: (info) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('weather_condition', {
      header: 'Weather',
      cell: (info) => {
        const val = info.getValue()
        if (!val) return <span className="text-zinc-400">—</span>
        return (
          <Badge
            className={`text-xs font-medium ${WEATHER_BADGE[val] ?? 'bg-zinc-100 text-zinc-600'}`}
            variant="outline"
          >
            {val}
          </Badge>
        )
      },
    }),
    columnHelper.accessor('work_accomplished', {
      header: 'Work Accomplished',
      cell: (info) => (
        <span className="line-clamp-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: (info) => {
        const val = info.getValue()
        return val
          ? <span className="line-clamp-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{val}</span>
          : <span className="text-zinc-400">—</span>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEditLog(row.original)}>
            Edit
          </Button>
        </div>
      ),
    }),
  ], [onEditLog])

  const table = useReactTable({
    data: logs,
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
                  <ClipboardList className="h-8 w-8" />
                  <p className="text-sm">No logs found for this project.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`cursor-pointer transition-colors ${
                  selectedLog?.id === row.original.id
                    ? 'bg-zinc-50 dark:bg-zinc-800/50'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                }`}
                onClick={() => onSelectLog(row.original)}
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
  )
}