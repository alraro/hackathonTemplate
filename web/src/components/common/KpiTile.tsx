import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiTileProps = { label: string; value: number | string; delta?: number; hint?: string }

const format = (v: number | string) => (typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(3)) : v)

export function KpiTile({ label, value, delta, hint }: KpiTileProps) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">{format(value)}</p>
        {delta !== undefined ? (
          <p className={cn("text-xs font-medium", delta >= 0 ? "text-emerald-600" : "text-destructive")}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(3)}
          </p>
        ) : null}
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
