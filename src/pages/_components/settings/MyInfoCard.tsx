import { useState } from 'react'
import { Mail, Shield, User as UserIcon } from 'lucide-react'
import { ROLE_LABEL } from '@/constants'
import type { UserResponse } from '@/validations/auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/pages/_components/ui/card'
import { Button } from '@/pages/_components/ui/button'
import EditMyInfoDialog from './EditMyInfoDialog'

interface Props {
  user: UserResponse
}

export default function MyInfoCard({ user }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Profile Information</CardTitle>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Update your name and contact details
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Account Details
        </p>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <Mail className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Email Address
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <Shield className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Role</p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {ROLE_LABEL[user.role_id] ?? 'Unknown'}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Personal Information
        </p>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <UserIcon className="h-4 w-4 text-zinc-400" />
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Full Name
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user.first_name} {user.last_name}
            </p>
          </div>
        </div>
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-500">
          Email address cannot be changed. Contact an administrator if needed.
        </p>
      </CardContent>
      <EditMyInfoDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  )
}
