import { useState } from 'react'
import type { ProjectResponse } from '@/validations/project'
import { useProject } from '@/hooks/useProject'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/pages/_components/ui/tabs'
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
import { Input } from '@/pages/_components/ui/input'
import { formatPHP } from '@/utils/formatPHP'
import CreatePhaseDialog from './CreatePhaseDialog'
import EditPhaseDialog from './EditPhaseDialog'
import AssignUserDialog from './AssignUserDialog'
import type { PhaseResponse, AssignedUser } from '@/validations/project'
import { useUnassignUser } from '@/hooks/useProject'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/pages/_components/ui/alert-dialog'

interface Props {
  project: ProjectResponse
  isOwner: boolean
  onClose: () => void
}

const PHASE_STATUS_BADGE: Record<string, string> = {
  'Not Started':
    'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'In Progress':
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'On Hold':
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function ProjectDetailPanel({
  project,
  isOwner,
  onClose,
}: Props) {
  const { data: detail, isLoading, isError } = useProject(project.id)

  const [createPhaseOpen, setCreatePhaseOpen] = useState(false)
  const [editPhase, setEditPhase] = useState<PhaseResponse | null>(null)
  const [assignManagerOpen, setAssignManagerOpen] = useState(false)
  const [assignWorkerOpen, setAssignWorkerOpen] = useState(false)
  const { mutate: unassignUser, isPending: unassigning } = useUnassignUser()
  const [unassignTarget, setUnassignTarget] = useState<{
    user: AssignedUser
    type: 'manager' | 'worker'
  } | null>(null)
  const [unassignInput, setUnassignInput] = useState('')

  const handleUnassignConfirm = () => {
    if (!unassignTarget) return
    unassignUser(
      {
        projectId: project.id,
        userId: unassignTarget.user.id,
        type: unassignTarget.type,
      },
      {
        onSuccess: () => {
          toast.success(
            `${unassignTarget.user.first_name} ${unassignTarget.user.last_name} unassigned successfully`,
          )
          setUnassignTarget(null)
          setUnassignInput('')
        },
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ?? 'Failed to unassign'
          toast.error(message)
        },
      },
    )
  }

  const renderPhaseProgress = (phase: PhaseResponse) => {
    // No actual spending per phase from backend yet — show allocated vs project total_budget ratio
    const ratio =
      project.total_budget > 0
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatePhaseOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Phase
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md border border-zinc-100 p-4 dark:border-zinc-800"
                >
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
            <p className="text-sm text-red-600">
              Failed to load project details.
            </p>
          )}

          {!isLoading && !isError && detail && (
            <>
              {!detail.phases || detail.phases.length === 0 ? (
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditPhase(phase)}
                              >
                                Edit Phase
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                          {formatPHP(phase.allocated_budget)} allocated ·{' '}
                          {progress}% of project budget
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Project Manager
                </p>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAssignManagerOpen(true)}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Assign Manager
                  </Button>
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : !detail?.managers || detail.managers.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  No manager assigned.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {detail.managers.map((m: AssignedUser) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {m.first_name} {m.last_name}
                        <span className="ml-2 text-xs text-zinc-400">
                          ({m.email})
                        </span>
                      </p>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 h-7 px-2 text-xs"
                          disabled={unassigning}
                          onClick={() =>
                            setUnassignTarget({ user: m, type: 'manager' })
                          }
                        >
                          Unassign
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Site Workers */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Site Workers
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAssignWorkerOpen(true)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Assign Worker
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : !detail?.workers || detail.workers.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  No workers assigned.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {detail.workers.map((w: AssignedUser) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {w.first_name} {w.last_name}
                        <span className="ml-2 text-xs text-zinc-400">
                          ({w.email})
                        </span>
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 h-7 px-2 text-xs"
                        disabled={unassigning}
                        onClick={() =>
                          setUnassignTarget({ user: w, type: 'worker' })
                        }
                      >
                        Unassign
                      </Button>
                    </div>
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
        onOpenChange={(open) => {
          if (!open) setEditPhase(null)
        }}
      />

      {/* Assignment Modals */}
      <AssignUserDialog
        project={project}
        type="manager"
        open={assignManagerOpen}
        onOpenChange={setAssignManagerOpen}
        excludeUserIds={detail?.managers?.map((m) => m.id) ?? []}
      />
      <AssignUserDialog
        project={project}
        type="worker"
        open={assignWorkerOpen}
        onOpenChange={setAssignWorkerOpen}
        excludeUserIds={detail?.workers?.map((w) => w.id) ?? []}
      />
      {/* Unassign Confirm Dialog */}
      <AlertDialog
        open={!!unassignTarget}
        onOpenChange={(open) => {
          if (!open) {
            setUnassignTarget(null)
            setUnassignInput('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unassign{' '}
              {unassignTarget?.type === 'manager'
                ? 'Project Manager'
                : 'Site Worker'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p>You are about to unassign:</p>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-800 dark:text-zinc-200">
                  <p>
                    <span className="font-medium">Name:</span>{' '}
                    {unassignTarget?.user.first_name}{' '}
                    {unassignTarget?.user.last_name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {unassignTarget?.user.email}
                  </p>
                  <p>
                    <span className="font-medium">Role:</span>{' '}
                    {unassignTarget?.type === 'manager'
                      ? 'Project Manager'
                      : 'Site Worker'}
                  </p>
                </div>
                <p>
                  This will remove their access to{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {project.name}
                  </span>
                  .
                </p>
                <p>
                  To confirm, type{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    unassign
                  </span>{' '}
                  below:
                </p>
                <Input
                  placeholder="unassign"
                  value={unassignInput}
                  onChange={(e) => setUnassignInput(e.target.value)}
                  disabled={unassigning}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnassignTarget(null)}
              disabled={unassigning}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              onClick={handleUnassignConfirm}
              disabled={unassigning || unassignInput !== 'unassign'}
            >
              {unassigning ? 'Unassigning...' : 'Unassign'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
