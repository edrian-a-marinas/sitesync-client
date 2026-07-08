import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/pages/_components/ui/dropdown-menu'
import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import { Bell } from 'lucide-react'
import {
  useGetNotifications,
  useMarkAsRead,
  useUnreadCount,
} from '@/hooks/useNotification'
import type { Notification } from '@/types/notification'

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

export function NotificationDropdown() {
  const { data: unreadData } = useUnreadCount()
  const { data, isLoading } = useGetNotifications()
  const markAsRead = useMarkAsRead()

  const notifications = data?.pages.flat() ?? []
  const unreadCount = unreadData?.unread_count ?? 0

  const handleSelect = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification._id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1.5 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-4 py-3">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0" />
        <ScrollArea className="h-80">
          {isLoading && (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          )}
          {!isLoading && notifications.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              No notifications yet
            </div>
          )}
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              onSelect={() => handleSelect(notification)}
              className={`flex cursor-pointer flex-col items-start gap-0.5 whitespace-normal rounded-none border-b px-4 py-3 ${
                notification.is_read ? '' : 'bg-accent/50'
              }`}
            >
              <span className="text-sm font-medium">{notification.title}</span>
              <span className="text-xs text-muted-foreground">
                {notification.message}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(notification.created_at)}
              </span>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
