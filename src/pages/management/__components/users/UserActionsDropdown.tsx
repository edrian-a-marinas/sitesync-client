import type { UserResponse } from '@/validations/auth'
import { ROLES } from '@/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/pages/_components/ui/dropdown-menu'
import { Button } from '@/pages/_components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface Props {
  user: UserResponse
  currentUserId: number | undefined
  isOwner: boolean
  canChangeStatus?: boolean
  onEdit: (user: UserResponse) => void
  onStatusChange: (user: UserResponse, action: 'activate' | 'deactivate') => void
}

// --- Used in ManageUsersPage ---
export default function UserActionsDropdown({ user, currentUserId, isOwner, canChangeStatus = true, onEdit, onStatusChange }: Props) {
  // Owner accounts are never editable or deactivatable
  if (user.role_id === ROLES.OWNER) return null

  const isSelf = user.id === currentUserId

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          Edit
        </DropdownMenuItem>
        {!isSelf && canChangeStatus && (
          user.is_active ? (
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={() => onStatusChange(user, 'deactivate')}
            >
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-emerald-600 dark:text-emerald-400"
              onClick={() => onStatusChange(user, 'activate')}
            >
              Activate
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}