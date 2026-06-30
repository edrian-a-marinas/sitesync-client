import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/pages/_components/ui/table'
import type { ProjectBudgetSummary } from '@/validations/dashboard'
import { formatPHP } from '@/utils/formatPHP'
import { Badge } from '@/pages/_components/ui/badge'

const columnHelper = createColumnHelper<ProjectBudgetSummary>()

const columns = [
  columnHelper.accessor('project_name', {
    header: 'Project',
    cell: (info) => (
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('total_budget', {
    header: 'Budget',
    cell: (info) => formatPHP(info.getValue(), 'short'),
  }),
  columnHelper.accessor('actual_spending', {
    header: 'Actual Spend',
    cell: (info) => formatPHP(info.getValue(), 'short'),
  }),
  columnHelper.accessor('is_over_budget', {
    header: 'Status',
    cell: (info) => {
      const over = info.getValue()
      return (
        <Badge
          variant={over ? 'destructive' : 'secondary'}
          className="rounded-full"
        >
          {over ? 'Over Budget' : 'On Track'}
        </Badge>
      )
    },
  }),
  columnHelper.accessor(
    (row) =>
      row.total_budget > 0
        ? Math.round((row.actual_spending / row.total_budget) * 100)
        : 0,
    {
      id: 'percent_used',
      header: '% Used',
      cell: (info) => {
        const value = info.getValue()
        const color =
          value >= 100
            ? 'bg-red-500'
            : value >= 75
              ? 'bg-amber-500'
              : 'bg-emerald-500'
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
              {value}%
            </span>
          </div>
        )
      },
    },
  ),
]

export function ProjectHealthTable({ data }: { data: ProjectBudgetSummary[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Project Health
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Active projects across all sites
          </p>
        </div>
        <Link
          to={ROUTES.PROJECTS}
          className="text-xs font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View all →
        </Link>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-zinc-100 dark:border-zinc-800"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-5 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : header.column.getIsSorted() === 'desc' ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-zinc-50 dark:border-zinc-800/60"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-300"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-5 py-6 text-center text-sm text-zinc-400"
              >
                No projects found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
