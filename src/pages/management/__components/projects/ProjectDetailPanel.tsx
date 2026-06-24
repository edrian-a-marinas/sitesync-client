import { useState } from 'react'
import type { ProjectResponse } from '@/validations/project'
import { useProject } from '@/hooks/useProject'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/_components/ui/tabs'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import { Progress } from '@/pages/_components/ui/progress'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/pages/_components/ui/dropdown-menu'
import { MoreHorizontal, Plus, X } from 'lucide-react'
import { formatPHP } from '@/utils/formatPHP'
import CreatePhaseDialog from './CreatePhaseDialog'
import EditPhaseDialog from './EditPhaseDialog'
import AssignUserDialog from './AssignUserDialog'
import type { PhaseResponse, AssignedUser } from '@/validations/project'

interface Props {
  project: ProjectResponse
  isOwner: boolean
  onClose: () => void
}

const PHASE_STATUS_BADGE: Record<string, string> = {
  'Not Started': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'On Hold': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function ProjectDetailPanel({ project, isOwner, onClose }: Props) {
  const { data: detail, isLoading, isError } = useProject(project.id)

  const [createPhaseOpen, setCreatePhaseOpen] = useState(false)
  const [editPhase, setEditPhase] = useState<PhaseResponse | null>(null)
  const [assignManagerOpen, setAssignManagerOpen] = useState(false)
  const [assignWorkerOpen, setAssignWorkerOpen] = useState(false)

  const renderPhaseProgress = (phase: PhaseResponse) => {
    // No actual spending per phase from backend yet — show allocated vs project total_budget ratio
    const ratio = project.total_budget > 0
      ? Math.min((phase.allocated_budget / project.total_budget) * 100, 100)
      : 0
    return Math.round(ratio)
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Panel Header */}
      <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {project.name}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {project.location} · {formatPHP(project.total_budget)}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="phases" className="px-5 py-4">
        <TabsList className="mb-4">
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* Phases Tab */}
        <TabsContent value="phases">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Project phases and budget allocation
            </p>
            {/* Owner can create phases, PM cannot */}
            {isOwner && (
              <Button size="sm" variant="outline" onClick={() => setCreatePhaseOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Phase
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-md border border-zinc-100 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-red-600">Failed to load project details.</p>
          )}

          {!isLoading && !isError && detail && (
            <>
              {(!detail.phases || detail.phases.length === 0) ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">
                  No phases yet.{isOwner ? ' Add the first phase.' : ''}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {detail.phases.map((phase) => {
                    const progress = renderPhaseProgress(phase)
                    return (
                      <div
                        key={phase.id}
                        className="rounded-md border border-zinc-100 p-4 dark:border-zinc-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {phase.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${PHASE_STATUS_BADGE[phase.status] ?? ''}`}
                            >
                              {phase.status}
                            </Badge>
                          </div>
                          {/* Owner: full edit. PM: can also edit phase (backend allows it) */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditPhase(phase)}>
                                Edit Phase
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                          {formatPHP(phase.allocated_budget)} allocated · {progress}% of project budget
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <div className="flex flex-col gap-6">
            {/* Project Managers */}
            {isOwner && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Manager</p>
                  <Button size="sm" variant="outline" onClick={() => setAssignManagerOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Assign Manager
                  </Button>
                </div>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : !detail?.managers || detail.managers.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">No manager assigned.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {detail.managers.map((m: AssignedUser) => (
                      <p key={m.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                        {m.first_name} {m.last_name}
                        <span className="ml-2 text-xs text-zinc-400">({m.email})</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Site Workers */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Site Workers</p>
                <Button size="sm" variant="outline" onClick={() => setAssignWorkerOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Assign Worker
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : !detail?.workers || detail.workers.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">No workers assigned.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {detail.workers.map((w: AssignedUser) => (
                    <p key={w.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                      {w.first_name} {w.last_name}
                      <span className="ml-2 text-xs text-zinc-400">({w.email})</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Phase Modals */}
      <CreatePhaseDialog
        project={project}
        open={createPhaseOpen}
        onOpenChange={setCreatePhaseOpen}
      />
      <EditPhaseDialog
        project={project}
        phase={editPhase}
        open={!!editPhase}
        onOpenChange={(open) => { if (!open) setEditPhase(null) }}
      />

      {/* Assignment Modals */}
      <AssignUserDialog
        project={project}
        type="manager"
        open={assignManagerOpen}
        onOpenChange={setAssignManagerOpen}
      />
      <AssignUserDialog
        project={project}
        type="worker"
        open={assignWorkerOpen}
        onOpenChange={setAssignWorkerOpen}
      />
    </div>
  )
}