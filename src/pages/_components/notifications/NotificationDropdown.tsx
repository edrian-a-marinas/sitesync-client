import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/pages/_components/ui/dropdown-menu'
import { Badge } from '@/pages/_components/ui/badge'
import { Button } from '@/pages/_components/ui/button'
import { Bell } from 'lucide-react'
import { AlertTriangle, DollarSign, FileText, X } from 'lucide-react'
import {
  useDeleteNotification,
  useGetNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
  useUnreadCount,
} from '@/hooks/useNotification'
import type { Notification } from '@/validations/notification'

function NotificationIcon({ type }: { type: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string }> = {
    incident: {
      icon: <AlertTriangle className="h-4 w-4" />,
      className:
        'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400/80',
    },
    report_ready: {
      icon: <FileText className="h-4 w-4" />,
      className: 'bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400',
    },
    budget_overrun: {
      icon: <DollarSign className="h-4 w-4" />,
      className:
        'bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-400',
    },
  }
  const { icon, className } = config[type] ?? {
    icon: <FileText className="h-4 w-4" />,
    className: 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  }
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${className}`}
    >
      {icon}
    </div>
  )
}
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
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()
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
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 max-h-[400px] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                markAllAsRead.mutate()
              }}
              className="cursor-pointer text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="mx-0" />
        <div>
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
              className={`group relative flex cursor-pointer flex-col items-start gap-0.5 whitespace-normal rounded-none border-b px-4 py-3 pr-8 ${
                notification.is_read
                  ? ''
                  : 'bg-accent/50 border-l-2 border-l-primary'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  deleteNotification.mutate(notification._id)
                }}
                aria-label="Delete notification"
                className="absolute right-2 top-2 cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex w-full gap-3">
                <NotificationIcon type={notification.type} />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {notification.message}
                  </span>
                  {(notification.data.project_name ||
                    notification.data.log_date) && (
                    <span className="text-xs text-muted-foreground">
                      {notification.data.project_name}
                      {notification.data.project_name &&
                        notification.data.log_date &&
                        ' · '}
                      {notification.data.log_date}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex flex-col gap-2 border-b px-4 py-3"
              >
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-2 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          {hasNextPage && !isFetchingNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="w-full cursor-pointer border-t px-4 py-3 text-center text-xs text-muted-foreground hover:bg-accent/50"
            >
              See previous notifications
            </button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
