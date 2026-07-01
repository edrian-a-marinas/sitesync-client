// DEMO FEATURE: delete this entire file if demo mode is retired
import { useState } from 'react'
import { Button } from '@/pages/_components/ui/button'
import { DemoRoleModal } from '@/demo/DemoRoleModal'

export function DemoLoginButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="mt-2 w-full"
        onClick={() => setOpen(true)}
      >
        🎯 Try a Demo Account
      </Button>
      <DemoRoleModal open={open} onOpenChange={setOpen} />
    </>
  )
}
