import { Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { ThemeToggle } from '@/pages/_components/ThemeToggle'
import { Button } from '@/pages/_components/ui/button'
import { NotificationDropdown } from '@/pages/_components/notifications/NotificationDropdown'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { ROLES } from '@/constants'
export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuthStore()
  const canReceiveNotifications =
    !!user &&
    (user.role_id === ROLES.OWNER || user.role_id === ROLES.PROJECT_MANAGER)
  useNotificationSocket(canReceiveNotifications)
  if (!user) return null
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {(user.role_id === ROLES.OWNER ||
          user.role_id === ROLES.PROJECT_MANAGER) && <NotificationDropdown />}
      </div>
    </header>
  )
}
