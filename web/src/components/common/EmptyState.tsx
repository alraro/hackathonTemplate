import type { ReactNode } from "react"
import { Inbox, type LucideIcon } from "lucide-react"

type EmptyStateProps = { title: string; description?: string; icon?: LucideIcon; action?: ReactNode }

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <Icon className="size-8 text-muted-foreground" aria-hidden />
      <h2 className="text-lg font-medium">{title}</h2>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  )
}
