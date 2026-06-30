import { Bell, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { ThemeToggle } from '@/pages/_components/ThemeToggle'
import { Button } from '@/pages/_components/ui/button'
export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuthStore()
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </Button>
      </div>
    </header>
  )
}
