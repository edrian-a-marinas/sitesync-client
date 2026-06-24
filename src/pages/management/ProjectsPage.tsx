import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useProjects } from '@/hooks/useProject'
import type { ProjectResponse } from '@/validations/project'
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
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { MoreHorizontal, Plus, FolderOpen, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatPHP } from '@/utils/formatPHP'
import CreateProjectDialog from './__components/projects/CreateProjectDialog'
import EditProjectDialog from './__components/projects/EditProjectDialog'
import DeleteConfirmDialog from './__components/projects/DeleteConfirmDialog'
import ProjectDetailPanel from './__components/projects/ProjectDetailPanel'

type StatusFilter = 'all' | 'Active' | 'Completed' | 'On Hold'

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'On Hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const columnHelper = createColumnHelper<ProjectResponse>()

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<ProjectResponse | null>(null)
  const [deleteProject, setDeleteProject] = useState<ProjectResponse | null>(null)

  const { data: projects, isLoading, isError } = useProjects(
    statusFilter === 'all' ? undefined : statusFilter
  )

  const handleView = (project: ProjectResponse) => {
    setSelectedProject(prev => prev?.id === project.id ? null : project)
  }

  const columns = [
    columnHelper.accessor('name', {
      header: 'Project Name',
      cell: (info) => (
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('total_budget', {
      header: 'Total Budget',
      cell: (info) => (
        <span className="text-zinc-700 dark:text-zinc-300">{formatPHP(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('start_date', {
      header: 'Start Date',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('target_end_date', {
      header: 'Target End',
      cell: (info) => (
        <span className="text-zinc-500 dark:text-zinc-400">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge
          className={`text-xs font-medium ${STATUS_BADGE[info.getValue()] ?? 'bg-zinc-100 text-zinc-600'}`}
          variant="outline"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const project = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleView(project)}>
                  View Details
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => setEditProject(project)}>
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => setDeleteProject(project)}
                    >
                      Delete Project
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: projects ?? [],
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
    <div className="flex flex-col gap-6 px-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Projects{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              — {isOwner ? 'Owner' : 'PM'} View
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOwner
              ? 'Manage all construction projects, phases, and assignments'
              : 'Your assigned projects — manage phases and workers'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          {isOwner && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load projects. Please try again.</AlertDescription>
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
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <FolderOpen className="h-8 w-8" />
                    <p className="text-sm">
                      {isOwner ? 'No projects yet. Create your first project.' : 'No assigned projects found.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer transition-colors ${
                    selectedProject?.id === row.original.id
                      ? 'bg-zinc-50 dark:bg-zinc-800/50'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`}
                  onClick={() => handleView(row.original)}
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

      {/* Detail Panel */}
      {selectedProject && (
        <ProjectDetailPanel
          project={selectedProject}
          isOwner={isOwner}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Modals */}
      {isOwner && (
        <>
          <CreateProjectDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
          <EditProjectDialog
            project={editProject}
            open={!!editProject}
            onOpenChange={(open) => { if (!open) setEditProject(null) }}
          />
          <DeleteConfirmDialog
            project={deleteProject}
            open={!!deleteProject}
            onOpenChange={(open) => { if (!open) setDeleteProject(null) }}
          />
        </>
      )}
    </div>
  )
}