import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import { useMaterials, useCreateMaterial, useUpdateMaterial } from '@/hooks/useMaterial'
import { MaterialCreateSchema, MaterialUpdateSchema } from '@/validations/material'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { Package, Plus, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import type { MaterialResponse } from '@/types/material'

interface Props {
  projectId: number
  logId: number
}

const emptyForm = { name: '', quantity: '', unit: '', unit_cost: '' }

export default function MaterialsSection({ projectId, logId }: Props) {
  const { user } = useAuthStore()
  const canEdit = user?.role_id === ROLES.OWNER || user?.role_id === ROLES.PROJECT_MANAGER

  const { data: materials, isLoading } = useMaterials(projectId, logId, true)
  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial(projectId, logId)
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial(projectId, logId)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

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
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(material)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
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
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Quantity"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <Input
              placeholder="Unit Cost"
              type="number"
              value={form.unit_cost}
              onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
            />
          </div>
          <Button size="sm" className="h-7 text-xs" disabled={isPending} onClick={handleSubmit}>
            {isPending ? 'Saving...' : editingId !== null ? 'Update' : 'Add Material'}
          </Button>
        </div>
      )}
    </div>
  )
}