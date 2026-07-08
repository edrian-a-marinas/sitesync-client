// DEMO FEATURE: delete this entire file if demo mode is retired
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/pages/_components/ui/dialog'
import { Button } from '@/pages/_components/ui/button'
import axios from 'axios'
import { useDemoLogin } from '@/demo/useDemoLogin'
import { DEMO_CREDENTIALS } from '@/demo/constants'
import type { DemoRole } from '@/demo/constants'

interface DemoRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoRoleModal({ open, onOpenChange }: DemoRoleModalProps) {
  const { mutate: demoLogin, isPending, isError, error } = useDemoLogin()
  const [pendingRole, setPendingRole] = useState<DemoRole | null>(null)
  const isNetworkError = axios.isAxiosError(error) && !error.response

  const handleSelect = (role: DemoRole) => {
    setPendingRole(role)
    demoLogin(role)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Try a Demo Account</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-zinc-500">
          Any of these accounts are READ / VIEW only for demo purposes.
        </p>
        <div className="flex flex-col gap-2 mt-2">
          {(Object.keys(DEMO_CREDENTIALS) as DemoRole[]).map((role) => {
            const isThisPending = isPending && pendingRole === role
            return (
              <Button
                key={role}
                variant="outline"
                disabled={isPending}
                onClick={() => handleSelect(role)}
                className={`relative ${isPending ? 'cursor-progress' : ''}`}
              >
                {isThisPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {DEMO_CREDENTIALS[role].label}
              </Button>
            )
          })}
        </div>
        {isError && isNetworkError && (
          <p className="mt-2 text-xs text-red-600">
            Unable to reach the server. Please check your connection or try
            again later.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
