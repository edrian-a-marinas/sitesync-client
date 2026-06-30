import { useState } from 'react'
import { useActivateUser, useDeactivateUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import type { UserResponse } from '@/validations/auth'
import { ROLE_LABEL } from '@/constants'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/pages/_components/ui/alert-dialog'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'

interface Props {
  target: { user: UserResponse; action: 'activate' | 'deactivate' } | null
  onOpenChange: (open: boolean) => void
}

// --- Used in ManageUsersPage ---
export default function StatusConfirmDialog({ target, onOpenChange }: Props) {
  const activateUser = useActivateUser()
  const deactivateUser = useDeactivateUser()
  const [confirmInput, setConfirmInput] = useState('')

  const isPending = activateUser.isPending || deactivateUser.isPending
  const confirmWord =
    target?.action === 'deactivate' ? 'deactivate' : 'activate'

  const handleConfirm = async () => {
    if (!target || confirmInput !== confirmWord) return
    try {
      if (target.action === 'activate') {
        await activateUser.mutateAsync(target.user.id)
        toast.success(`${target.user.first_name} activated.`)
      } else {
        await deactivateUser.mutateAsync(target.user.id)
        toast.success(`${target.user.first_name} deactivated.`)
      }
      setConfirmInput('')
      onOpenChange(false)
    } catch {
      toast.error('Failed to update user status.')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) setConfirmInput('')
    onOpenChange(open)
  }

  return (
    <AlertDialog open={!!target} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {target?.action === 'deactivate' ? 'Deactivate' : 'Activate'} User
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>You are about to {target?.action}:</p>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-zinc-800 dark:text-zinc-200">
                <p>
                  <span className="font-medium">Name:</span>{' '}
                  {target?.user.first_name} {target?.user.last_name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {target?.user.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{' '}
                  {target?.user.role_id !== undefined
                    ? ROLE_LABEL[target.user.role_id]
                    : '—'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {target?.user.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              {target?.action === 'deactivate' ? (
                <p>
                  This will prevent{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {target?.user.first_name}
                  </span>{' '}
                  from logging in. You can reactivate them anytime.
                </p>
              ) : (
                <p>
                  This will restore{' '}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {target?.user.first_name}
                  </span>
                  's access to the system.
                </p>
              )}
              <p>
                To confirm, type{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {confirmWord}
                </span>{' '}
                below:
              </p>
              <Input
                placeholder={confirmWord}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                disabled={isPending}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || confirmInput !== confirmWord}
            className={
              target?.action === 'deactivate'
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800'
            }
          >
            {isPending
              ? target?.action === 'deactivate'
                ? 'Deactivating...'
                : 'Activating...'
              : target?.action === 'deactivate'
                ? 'Deactivate'
                : 'Activate'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
