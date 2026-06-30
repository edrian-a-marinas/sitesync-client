import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/pages/_components/ui/dialog'
import { Badge } from '@/pages/_components/ui/badge'
import { Skeleton } from '@/pages/_components/ui/skeleton'
import { useUserAssignments } from '@/hooks/useUser'
import type { UserResponse } from '@/validations/auth'
import { ROLE_LABEL } from '@/constants'
import { FolderOpen, MapPin } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  Active:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'On Hold':
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

interface Props {
  user: UserResponse | null
  onOpenChange: (open: boolean) => void
}

export default function UserAssignmentsModal({ user, onOpenChange }: Props) {
  const { data: assignments, isLoading } = useUserAssignments(user?.id ?? null)

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user ? `${user.first_name} ${user.last_name}` : ''}
          </DialogTitle>
          {user && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {ROLE_LABEL[user.role_id]} — Project Assignments
            </p>
          )}
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : !assignments || assignments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-zinc-400 dark:text-zinc-500">
              <FolderOpen className="h-8 w-8" />
              <p className="text-sm">Not assigned to any project.</p>
            </div>
          ) : (
            assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {a.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <MapPin className="h-3 w-3" />
                    {a.location}
                  </span>
                </div>
                <Badge
                  className={`text-xs font-medium ${STATUS_BADGE[a.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                  variant="outline"
                >
                  {a.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
