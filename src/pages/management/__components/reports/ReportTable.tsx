import { useMemo, useState } from 'react'
import type { ReportResponse } from '@/types/report'
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
import { FileText, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Badge } from '@/pages/_components/ui/badge'
import { toast } from 'sonner'
import { formatPHP, getMoneyTooltip } from '@/utils/formatPHP'
import { downloadReport } from '@/services/report'

const columnHelper = createColumnHelper<ReportResponse>()

interface Props {
  reports: ReportResponse[]
  isLoading: boolean
  selectedReport: ReportResponse | null
  onSelectReport: (report: ReportResponse) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}
export default function ReportTable({ reports, isLoading, selectedReport, onSelectReport, page, totalPages, onPageChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])

  const handleDownload = async (report: ReportResponse) => {
    try {
      await downloadReport(report.project_id, report.id)
    } catch {
      toast.error('Failed to download report. Please try again.')
    }
  }

  const columns = useMemo(() => [
    columnHelper.accessor('week_start', {
      header: 'Week Start',
      cell: (info) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('week_end', {
      header: 'Week End',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('total_hours', {
      header: 'Total Hours',
      cell: (info) => (
        <span className="text-zinc-700 dark:text-zinc-300">{info.getValue().toLocaleString()}h</span>
      ),
    }),
    columnHelper.accessor('total_material_cost', {
      header: 'Material Cost',
      cell: (info) => (
        <span className="text-zinc-700 dark:text-zinc-300" title={getMoneyTooltip(info.getValue())}>
          {formatPHP(info.getValue(), 'short')}
        </span>
      ),
    }),
    columnHelper.accessor('incident_count', {
      header: 'Incidents',
      cell: (info) => {
        const count = info.getValue()
        const open = info.row.original.open_incident_count
        if (count === 0) return <span className="text-zinc-400">—</span>
        return (
          <span className={open > 0 ? 'font-medium text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'}>
            {count}{open > 0 ? ` (${open} open)` : ''}
          </span>
        )
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Generated On',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">
          {new Date(info.getValue()).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    }),
    columnHelper.accessor('source', {
      header: 'Source',
      cell: (info) => (
        <Badge
          variant="outline"
          className={
            info.getValue() === 'scheduled'
              ? 'bg-blue-50 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : info.getValue() === 'seeded'
              ? 'bg-amber-50 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
          }
        >
          {info.getValue() === 'scheduled' ? 'Auto (Monday)' : info.getValue() === 'seeded' ? 'Historical' : 'Manual'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(row.original)}
            disabled={!row.original.file_url}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download
          </Button>
        </div>
      ),
    }),
  ], [])

  const table = useReactTable({
    data: reports,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 7 }).map((__, j) => (
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
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                  <FileText className="h-8 w-8" />
                  <p className="text-sm">No reports generated yet for this project.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={`cursor-pointer transition-colors ${
                  selectedReport?.id === row.original.id
                    ? 'bg-zinc-50 dark:bg-zinc-800/50'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                }`}
                onClick={() => onSelectReport(row.original)}
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
    {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}