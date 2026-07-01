// DEMO FEATURE: delete this entire file if demo mode is retired
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/pages/_components/ui/dialog'
import { Button } from '@/pages/_components/ui/button'
import { useDemoLogin } from '@/demo/useDemoLogin'
import { DEMO_CREDENTIALS } from '@/demo/constants'
import type { DemoRole } from '@/demo/constants'

interface DemoRoleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoRoleModal({ open, onOpenChange }: DemoRoleModalProps) {
  const { mutate: demoLogin, isPending } = useDemoLogin()

  const handleSelect = (role: DemoRole) => {
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
          {(Object.keys(DEMO_CREDENTIALS) as DemoRole[]).map((role) => (
            <Button
              key={role}
              variant="outline"
              disabled={isPending}
              onClick={() => handleSelect(role)}
            >
              {DEMO_CREDENTIALS[role].label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
