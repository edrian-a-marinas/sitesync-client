import { useState } from 'react'
import { Lock, ShieldAlert, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { ROLES } from '@/constants'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'

export default function DangerZoneCard() {
  const { user } = useAuthStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  if (!user) return null

  const isOwner = user.role_id === ROLES.OWNER

  return (
    <div className="rounded-xl border border-red-500/25 bg-white shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-red-500/20 bg-red-500/[0.04] px-6 py-3.5">
        <div>
          <p className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Permanent and irreversible actions</p>
        </div>
        {isOwner && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-bold text-amber-600 dark:text-amber-400">
            <Lock className="h-2.5 w-2.5" />
            Owner Protected
          </span>
        )}
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/[0.07] px-3.5 py-2.5 text-xs text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
          {isOwner
            ? 'The Owner account cannot be deactivated. This section is shown for reference only.'
            : 'Deactivating your account signs you out immediately. An Owner can reactivate it later.'}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Deactivate My Account</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Deactivates your account and signs you out. Your data is retained for record-keeping. This action
              requires an Owner to reverse.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={isOwner}
            onClick={() => setConfirmOpen(true)}
            className="flex-shrink-0 gap-1.5 border-red-500/30 bg-red-500/[0.04] text-red-600/90 hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:text-red-500/35 dark:text-red-400/90 dark:hover:text-red-400"
          >
            {isOwner ? <Lock className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
            Deactivate Account
            {isOwner && (
              <span className="ml-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-amber-600 dark:text-amber-400">
                N/A
              </span>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!open) { setConfirmOpen(false); setConfirmInput('') } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p>You are about to deactivate:</p>
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                </div>
                <p>
                  You will be signed out immediately and won't be able to log back in until an Owner reactivates
                  your account.
                </p>
                <p>To confirm, type <span className="font-semibold text-zinc-900 dark:text-zinc-100">deactivate</span> below:</p>
                <Input
                  placeholder="deactivate"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => { setConfirmOpen(false); setConfirmInput('') }}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              disabled={confirmInput !== 'deactivate'}
            >
              Deactivate Account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}