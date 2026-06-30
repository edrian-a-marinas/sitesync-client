import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useAttendance, useCreateAttendance } from '@/hooks/useAttendance'
import { useProjectDetail } from '@/hooks/useProject'
import { AttendanceCreateSchema } from '@/validations/attendance'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'

interface Props {
  projectId: number
  logId: number
  onCountChange?: (count: number) => void
}

const emptyForm = { worker_id: '', hours_worked: '' }

export default function AttendanceSection({ projectId, logId, onCountChange }: Props) {
  const { user } = useAuthStore()
  const canEdit = user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER
  const { data: attendance, isLoading } = useAttendance(projectId, logId, true)
  const { data: project } = useProjectDetail(projectId)
  useEffect(() => {
    onCountChange?.(attendance?.length ?? 0)
  }, [attendance?.length, onCountChange])
  const { mutate: createAttendance, isPending } = useCreateAttendance(projectId, logId)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loggedWorkerIds = new Set((attendance ?? []).map((a) => a.worker_id))
  const availableWorkers = (project?.workers ?? []).filter((w) => !loggedWorkerIds.has(w.id))

  const resetForm = () => {
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleSubmit = () => {
    const payload = {
      worker_id: Number(form.worker_id),
      hours_worked: Number(form.hours_worked),
    }
    const result = AttendanceCreateSchema.safeParse(payload)
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }
    createAttendance(result.data, {
      onSuccess: () => {
        toast.success('Attendance logged.')
        resetForm()
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to log attendance. Please try again.'
        toast.error(message)
      },
    })
  }

  const getWorkerName = (workerId: number) => {
    const worker = project?.workers?.find((w) => w.id === workerId)
    return worker ? `${worker.first_name} ${worker.last_name}` : `Worker #${workerId}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {attendance && attendance.length > 0 ? `${attendance.length} worker${attendance.length !== 1 ? 's' : ''}` : ''}
        </span>
        {canEdit && !showForm && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={availableWorkers.length === 0 ? 'cursor-not-allowed' : ''}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    disabled={availableWorkers.length === 0}
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </span>
              </TooltipTrigger>
              {availableWorkers.length === 0 && (
                <TooltipContent>
                  <p>
                    {(project?.workers?.length ?? 0) === 0
                      ? 'No workers assigned to this project.'
                      : 'All assigned workers already have attendance logged for this log.'}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : !attendance || attendance.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">No attendance logged.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {attendance.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{getWorkerName(entry.worker_id)}</span>
              <span className="text-xs text-zinc-400">{entry.hours_worked} hrs</span>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Log Attendance</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={resetForm}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Worker</label>
              <Select value={form.worker_id} onValueChange={(value) => setForm({ ...form, worker_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkers.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.first_name} {w.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Hours Worked</label>
              <Input
                placeholder="0"
                type="number"
                value={form.hours_worked}
                onChange={(e) => setForm({ ...form, hours_worked: e.target.value })}
              />
            </div>
          </div>
          <Button size="sm" className="h-7 text-xs" disabled={isPending} onClick={handleSubmit}>
            {isPending ? 'Saving...' : 'Log Attendance'}
          </Button>
        </div>
      )}
    </div>
  )
}