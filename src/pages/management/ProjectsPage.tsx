import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useProjects } from '@/hooks/useProject'
import type { ProjectResponse } from '@/validations/project'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'
import { Alert, AlertDescription } from '@/pages/_components/ui/alert'
import { Button } from '@/pages/_components/ui/button'
import { Plus } from 'lucide-react'
import CreateProjectDialog from './__components/projects/CreateProjectDialog'
import EditProjectDialog from './__components/projects/EditProjectDialog'
import DeleteConfirmDialog from './__components/projects/DeleteConfirmDialog'
import ProjectDetailPanel from './__components/projects/ProjectDetailPanel'
import ProjectsTable from './__components/projects/ProjectsTable'
type StatusFilter = 'all' | 'Active' | 'Completed' | 'On Hold'

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const isOwner = user?.role_id === ROLES.OWNER
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Active')
  const [selectedProject, setSelectedProject] =
    useState<ProjectResponse | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<ProjectResponse | null>(null)
  const [deleteProject, setDeleteProject] = useState<ProjectResponse | null>(
    null,
  )

  const {
    data: projects,
    isLoading,
    isError,
  } = useProjects(statusFilter === 'all' ? undefined : statusFilter)
  const handleView = (project: ProjectResponse) => {
    setSelectedProject((prev) => (prev?.id === project.id ? null : project))
  }

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
          <AlertDescription>
            Failed to load projects. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <ProjectsTable
        projects={projects ?? []}
        isLoading={isLoading}
        selectedProject={selectedProject}
        onSelectProject={handleView}
        isOwner={isOwner}
        onEdit={setEditProject}
        onDelete={setDeleteProject}
      />

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
          <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
          <EditProjectDialog
            project={editProject}
            open={!!editProject}
            onOpenChange={(open) => {
              if (!open) setEditProject(null)
            }}
          />
          <DeleteConfirmDialog
            project={deleteProject}
            open={!!deleteProject}
            onOpenChange={(open) => {
              if (!open) setDeleteProject(null)
            }}
          />
        </>
      )}
    </div>
  )
}
