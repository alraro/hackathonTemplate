import { useState } from "react"
import { useChannel } from "@/lib/realtime/useChannel"
import { cn } from "@/lib/utils"

/** Live count of clients on `presence:<topic>` (e.g. `<PresenceBadge topic="room-1" />`). */
export function PresenceBadge({ topic, className }: { topic: string; className?: string }) {
  const [count, setCount] = useState(0)
  const { status } = useChannel<{ count: number }>(`presence:${topic}`, {
    invalidate: false,
    onMessage: (d) => setCount(d.count),
  })
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs", className)}>
      <span className={cn("size-2 rounded-full", status === "open" ? "bg-green-500" : "bg-muted-foreground")} aria-hidden />
      {count} online
    </span>
  )
}
