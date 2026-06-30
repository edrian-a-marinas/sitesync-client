import { useState } from 'react'
import { Lock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/pages/_components/ui/card'
import { Button } from '@/pages/_components/ui/button'
import ChangePasswordDialog from './ChangePasswordDialog'
import DangerZoneCard from './DangerZoneCard'

export default function SecurityTab() {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Security</CardTitle>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage your account password</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Change Password
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <Lock className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Password</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">••••••••</p>
          </div>
        </div>
      </CardContent>
      <ChangePasswordDialog open={open} onOpenChange={setOpen} />
    </Card>
  )
}