import { useActivateUser, useDeactivateUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import type { UserResponse } from '@/validations/auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'

interface Props {
  target: { user: UserResponse; action: 'activate' | 'deactivate' } | null
  onOpenChange: (open: boolean) => void
}

// --- Used in ManageUsersPage ---
export default function StatusConfirmDialog({ target, onOpenChange }: Props) {
  const activateUser = useActivateUser()
  const deactivateUser = useDeactivateUser()

  const handleConfirm = async () => {
    if (!target) return
    try {
      console.log('[StatusConfirmDialog] action:', target.action, 'user:', target.user.id)
      if (target.action === 'activate') {
        await activateUser.mutateAsync(target.user.id)
        toast.success(`${target.user.first_name} activated.`)
      } else {
        await deactivateUser.mutateAsync(target.user.id)
        toast.success(`${target.user.first_name} deactivated.`)
      }
      onOpenChange(false)
    } catch (err) {
      console.error('[StatusConfirmDialog] error:', err)
      toast.error('Failed to update user status.')
    }
  }

  return (
    <AlertDialog open={!!target} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {target?.action === 'deactivate' ? 'Deactivate' : 'Activate'} User
          </AlertDialogTitle>
          <AlertDialogDescription>
            {target?.action === 'deactivate'
              ? `This will prevent ${target?.user.first_name} from logging in. You can reactivate them anytime.`
              : `This will restore ${target?.user.first_name}'s access to the system.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              target?.action === 'deactivate'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }
          >
            {target?.action === 'deactivate' ? 'Deactivate' : 'Activate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}