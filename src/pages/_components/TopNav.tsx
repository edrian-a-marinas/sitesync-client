import { Bell, Menu } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { ThemeToggle } from "@/pages/_components/ThemeToggle"
export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuthStore()
  if (!user) return null
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
        </button>
      </div>
    </header>
  )
}