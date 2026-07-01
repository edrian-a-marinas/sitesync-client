import { useState } from 'react'
import { useMyAttendanceHistory } from '@/hooks/useAttendance'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/pages/_components/ui/table'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { CalendarCheck } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/pages/_components/ui/pagination'

interface Props {
  projectId: number
}

const PAGE_SIZE = 20

export default function AttendanceTab({ projectId }: Props) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useMyAttendanceHistory(
    projectId,
    page,
    PAGE_SIZE,
    true,
  )

  const rows = Array.isArray(data) ? data : []
  const hasNext = rows.length === PAGE_SIZE

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">Failed to load attendance history.</p>
    )
  }

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

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-zinc-400 dark:text-zinc-500">
          <CalendarCheck className="h-10 w-10" />
          <p className="text-sm">No attendance records yet.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours Worked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.log_date}</TableCell>
                    <TableCell>{row.hours_worked}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => p + 1)}
                  aria-disabled={!hasNext}
                  className={!hasNext ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  )
}
