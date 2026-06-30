import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial } from '@/hooks/useMaterial'
import { MaterialCreateSchema, MaterialUpdateSchema } from '@/validations/material'
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
import { Package, Plus, Pencil, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { MaterialResponse } from '@/types/material'

interface Props {
  projectId: number
  logId: number
}

const emptyForm = { name: '', quantity: '', unit: '', unit_cost: '' }

const UNIT_OPTIONS = ['pc', 'bd.ft', 'kg', 'ton', 'bag', 'm', 'sq.m', 'cu.m', 'L', 'gal', 'roll', 'box', 'sack', 'set', 'lot']

export default function MaterialsSection({ projectId, logId }: Props) {
  const { user } = useAuthStore()
  const canEdit = user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER

  const { data: materials, isLoading } = useMaterials(projectId, logId, true)
  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial(projectId, logId)
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial(projectId, logId)
  const { mutate: deleteMaterial, isPending: isDeleting } = useDeleteMaterial(projectId, logId)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<MaterialResponse | null>(null)
  const [confirmInput, setConfirmInput] = useState('')

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteTarget(null)
      setConfirmInput('')
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteMaterial(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Material deleted.')
        handleDeleteOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to delete material. Please try again.')
      },
    })
  }

  const isDeleteMatch = confirmInput === deleteTarget?.name

  const resetForm = () => {
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
  }

  const startEdit = (material: MaterialResponse) => {
    setForm({
      name: material.name,
      quantity: String(material.quantity),
      unit: material.unit,
      unit_cost: String(material.unit_cost),
    })
    setEditingId(material.id)
    setShowForm(true)
  }

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      quantity: Number(form.quantity),
      unit: form.unit,
      unit_cost: Number(form.unit_cost),
    }

    if (editingId !== null) {
      const result = MaterialUpdateSchema.safeParse(payload)
      if (!result.success) {
        toast.error('Please fill in all fields correctly.')
        return
      }
      const original = materials?.find((m) => m.id === editingId)
      const hasChanges =
        original &&
        (result.data.name !== original.name ||
          result.data.quantity !== original.quantity ||
          result.data.unit !== original.unit ||
          result.data.unit_cost !== original.unit_cost)
      if (!hasChanges) {
        toast.error('Nothing to update.')
        return
      }
      updateMaterial(
        { materialId: editingId, data: result.data },
        {
          onSuccess: () => {
            toast.success('Material updated.')
            resetForm()
          },
          onError: () => toast.error('Failed to update material. Please try again.'),
        }
      )
      return
    }

    const result = MaterialCreateSchema.safeParse(payload)
    if (!result.success) {
      toast.error('Please fill in all fields correctly.')
      return
    }
    createMaterial(result.data, {
      onSuccess: () => {
        toast.success('Material added.')
        resetForm()
      },
      onError: () => toast.error('Failed to add material. Please try again.'),
    })
  }

  const isPending = isCreating || isUpdating

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <Package className="h-3.5 w-3.5" />
          Materials
        </div>
        {canEdit && !showForm && (
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : !materials || materials.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">No materials logged.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{material.name}</span>
                <span className="text-xs text-zinc-400">
                  {material.quantity} {material.unit} × ₱{material.unit_cost.toLocaleString()} = ₱{material.total_cost.toLocaleString()}
                </span>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(material)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteTarget(material)}>
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
            <span className="text-xs font-medium text-zinc-500">{editingId !== null ? 'Edit Material' : 'New Material'}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={resetForm}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Material Name</label>
            <Input placeholder="e.g. Lumber" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Quantity</label>
              <Input
                placeholder="0"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Unit</label>
              <Select value={form.unit} onValueChange={(value) => setForm({ ...form, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Unit Cost (₱)</label>
              <Input
                placeholder="0.00"
                type="number"
                value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
              />
            </div>
          </div>
          <Button size="sm" className="h-7 text-xs" disabled={isPending} onClick={handleSubmit}>
            {isPending ? 'Saving...' : editingId !== null ? 'Update' : 'Add Material'}
          </Button>
        </div>
      )}

      <AlertDialog open={deleteTarget !== null} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  This will permanently delete{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTarget?.name}</span>{' '}
                  ({deleteTarget?.quantity} {deleteTarget?.unit}). This action cannot be undone.
                </p>
                <p>
                  To confirm, type{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTarget?.name}</span> below:
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
            <Button variant="outline" onClick={() => handleDeleteOpenChange(false)} disabled={isDeleting}>
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