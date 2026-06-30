import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import {
  useEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from '@/hooks/useEquipment'
import {
  EquipmentCreateSchema,
  EquipmentUpdateSchema,
} from '@/validations/equipment'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'
import { Skeleton } from '@/pages/_components/ui/skeleton'
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
import type { EquipmentResponse } from '@/types/equipment'

interface Props {
  projectId: number
  logId: number
  onCountChange?: (count: number) => void
}

const emptyForm = { name: '', quantity: '', condition: '' }

const CONDITION_OPTIONS = [
  'Good',
  'Fair',
  'Needs Inspection',
  'Needs Repair',
  'Under Maintenance',
  'Broken',
  'Decommissioned',
]

export default function EquipmentSection({
  projectId,
  logId,
  onCountChange,
}: Props) {
  const { user } = useAuthStore()
  const canEdit =
    user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER

  const { data: equipment, isLoading } = useEquipment(projectId, logId, true)

  useEffect(() => {
    onCountChange?.(equipment?.length ?? 0)
  }, [equipment?.length, onCountChange])

  const { mutate: createEquipment, isPending: isCreating } = useCreateEquipment(
    projectId,
    logId,
  )
  const { mutate: updateEquipment, isPending: isUpdating } = useUpdateEquipment(
    projectId,
    logId,
  )
  const { mutate: deleteEquipment, isPending: isDeleting } = useDeleteEquipment(
    projectId,
    logId,
  )

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<EquipmentResponse | null>(
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
    deleteEquipment(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Equipment deleted.')
        handleDeleteOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to delete equipment. Please try again.')
      },
    })
  }

  const isDeleteMatch = confirmInput === deleteTarget?.name

  const resetForm = () => {
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (item: EquipmentResponse) => {
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      condition: item.condition ?? '',
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      quantity: Number(form.quantity),
      condition: form.condition || undefined,
    }

    if (editingId !== null) {
      const result = EquipmentUpdateSchema.safeParse(payload)
      if (!result.success) {
        toast.error('Please fill in all fields correctly.')
        return
      }
      const original = equipment?.find((e) => e.id === editingId)
      const hasChanges =
        original &&
        (result.data.name !== original.name ||
          result.data.quantity !== original.quantity ||
          (result.data.condition ?? null) !== original.condition)
      if (!hasChanges) {
        toast.error('Nothing to update.')
        return
      }
      updateEquipment(
        { equipmentId: editingId, data: result.data },
        {
          onSuccess: () => {
            toast.success('Equipment updated.')
            resetForm()
          },
          onError: () =>
            toast.error('Failed to update equipment. Please try again.'),
        },
      )
      return
    }

    const result = EquipmentCreateSchema.safeParse(payload)
    if (!result.success) {
      toast.error('Please fill in all required fields correctly.')
      return
    }
    createEquipment(result.data, {
      onSuccess: () => {
        toast.success('Equipment added.')
        resetForm()
      },
      onError: () => toast.error('Failed to add equipment. Please try again.'),
    })
  }

  const isPending = isCreating || isUpdating

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {equipment && equipment.length > 0
            ? `${equipment.length} item${equipment.length !== 1 ? 's' : ''}`
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
      ) : !equipment || equipment.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          No equipment logged.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {item.name}
                </span>
                <span className="text-xs text-zinc-400">
                  Qty: {item.quantity}
                  {item.condition ? ` · ${item.condition}` : ''}
                </span>
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
              {editingId !== null ? 'Edit Equipment' : 'New Equipment'}
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
              Equipment Name
            </label>
            <Input
              placeholder="e.g. Excavator"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Quantity
              </label>
              <Input
                placeholder="0"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Condition (optional)
              </label>
              <Select
                value={form.condition}
                onValueChange={(value) =>
                  setForm({ ...form, condition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="— None —" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
                : 'Add Equipment'}
          </Button>
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={handleDeleteOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  This will permanently delete{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {deleteTarget?.name}
                  </span>{' '}
                  (Qty: {deleteTarget?.quantity}). This action cannot be undone.
                </p>
                <p>
                  To confirm, type{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {deleteTarget?.name}
                  </span>{' '}
                  below:
                </p>
                <Input
                  placeholder={deleteTarget?.name}
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
