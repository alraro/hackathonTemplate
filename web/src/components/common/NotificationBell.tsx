import { useState } from "react"
import { Bell } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useChannel } from "@/lib/realtime/useChannel"
import { useSession } from "@/lib/session"

type Notification = { title: string; body: string }

/** Bell with unread count and a dropdown list; toasts on arrival. Subscribed to `notifications:<user_id>`. */
export function NotificationBell() {
  const { user } = useSession()
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  useChannel<Notification>(`notifications:${user?.id ?? "anonymous"}`, {
    invalidate: false,
    onMessage: (n) => {
      setItems((prev) => [n, ...prev].slice(0, 20))
      setUnread((c) => c + 1)
      toast(n.title, { description: n.body })
    },
  })
  return (
    <DropdownMenu onOpenChange={(open) => open && setUnread(0)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="size-4" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && <DropdownMenuItem disabled>No notifications yet</DropdownMenuItem>}
        {items.map((n, i) => (
          <DropdownMenuItem key={i} className="flex-col items-start gap-0.5">
            <span className="font-medium">{n.title}</span>
            <span className="text-xs text-muted-foreground">{n.body}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
