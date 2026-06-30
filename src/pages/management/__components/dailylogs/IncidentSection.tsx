import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import {
  useIncident,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
} from '@/hooks/useIncident'
import {
  IncidentCreateSchema,
  IncidentUpdateSchema,
} from '@/validations/incident'
import { Button } from '@/pages/_components/ui/button'
import { Textarea } from '@/pages/_components/ui/textarea'
import { Input } from '@/pages/_components/ui/input'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Badge } from '@/pages/_components/ui/badge'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'
import { Plus, Pencil, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { IncidentResponse } from '@/types/incident'

interface Props {
  projectId: number
  logId: number
  onCountChange?: (count: number) => void
}

const emptyForm = { description: '', severity: '', status: 'Open' }

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High']
const STATUS_OPTIONS = ['Open', 'Resolved']

const SEVERITY_BADGE: Record<string, string> = {
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Medium:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Resolved:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function IncidentSection({
  projectId,
  logId,
  onCountChange,
}: Props) {
  const { user } = useAuthStore()
  const canEdit =
    user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER

  const { data: incidents, isLoading } = useIncident(projectId, logId, true)

  useEffect(() => {
    onCountChange?.(incidents?.length ?? 0)
  }, [incidents?.length, onCountChange])

  const { mutate: createIncident, isPending: isCreating } = useCreateIncident(
    projectId,
    logId,
  )
  const { mutate: updateIncident, isPending: isUpdating } = useUpdateIncident(
    projectId,
    logId,
  )
  const { mutate: deleteIncident, isPending: isDeleting } = useDeleteIncident(
    projectId,
    logId,
  )

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<IncidentResponse | null>(
    null,
  )
  const [confirmInput, setConfirmInput] = useState('')

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteTarget(null)
      setConfirmInput('')
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteIncident(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Incident deleted.')
        handleDeleteOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to delete incident. Please try again.')
      },
    })
  }

  const isDeleteMatch = confirmInput === 'DELETE'

  const resetForm = () => {
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (item: IncidentResponse) => {
    setForm({
      description: item.description,
      severity: item.severity,
      status: item.status,
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleSubmit = () => {
    const payload = {
      description: form.description,
      severity: form.severity,
      status: form.status,
    }

    if (editingId !== null) {
      const result = IncidentUpdateSchema.safeParse(payload)
      if (!result.success) {
        toast.error('Please fill in all fields correctly.')
        return
      }
      const original = incidents?.find((i) => i.id === editingId)
      const hasChanges =
        original &&
        (result.data.description !== original.description ||
          result.data.severity !== original.severity ||
          result.data.status !== original.status)
      if (!hasChanges) {
        toast.error('Nothing to update.')
        return
      }
      updateIncident(
        { incidentId: editingId, data: result.data },
        {
          onSuccess: () => {
            toast.success('Incident updated.')
            resetForm()
          },
          onError: () =>
            toast.error('Failed to update incident. Please try again.'),
        },
      )
      return
    }

    const result = IncidentCreateSchema.safeParse(payload)
    if (!result.success) {
      toast.error('Please fill in all required fields correctly.')
      return
    }
    createIncident(result.data, {
      onSuccess: () => {
        toast.success('Incident reported.')
        resetForm()
      },
      onError: () =>
        toast.error('Failed to report incident. Please try again.'),
    })
  }

  const isPending = isCreating || isUpdating

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {incidents && incidents.length > 0
            ? `${incidents.length} incident${incidents.length !== 1 ? 's' : ''}`
            : ''}
        </span>
        {canEdit && !showForm && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : !incidents || incidents.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          No incidents reported.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {incidents.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {item.description}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={`text-xs font-medium ${SEVERITY_BADGE[item.severity] ?? ''}`}
                    variant="outline"
                  >
                    {item.severity}
                  </Badge>
                  <Badge
                    className={`text-xs font-medium ${STATUS_BADGE[item.status] ?? ''}`}
                    variant="outline"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => startEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">
              {editingId !== null ? 'Edit Incident' : 'New Incident'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={resetForm}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">
              Description
            </label>
            <Textarea
              placeholder="Describe what happened"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Severity
              </label>
              <Select
                value={form.severity}
                onValueChange={(value) => setForm({ ...form, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Status
              </label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending
              ? 'Saving...'
              : editingId !== null
                ? 'Update'
                : 'Report Incident'}
          </Button>
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={handleDeleteOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Incident</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  This will permanently delete this incident report:{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {deleteTarget?.description}
                  </span>
                  . This action cannot be undone.
                </p>
                <p>
                  To confirm, type{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    DELETE
                  </span>{' '}
                  below:
                </p>
                <Input
                  placeholder="DELETE"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  disabled={isDeleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDeleteOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              onClick={handleDeleteConfirm}
              disabled={!isDeleteMatch || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
