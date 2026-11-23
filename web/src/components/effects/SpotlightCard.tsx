// Dark Tech signature effect. Hand-written with Motion; reads only theme tokens.
// Usage: <SpotlightCard className="p-6">...content...</SpotlightCard>
// A primary-colored glow follows the pointer. Under prefers-reduced-motion the glow stays static and always visible.
import type { PointerEvent, ReactNode } from "react"
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type SpotlightCardProps = { radius?: number; className?: string; children?: ReactNode }

export function SpotlightCard({ radius = 260, className, children }: SpotlightCardProps) {
  const reduce = useReducedMotion()
  const x = useMotionValue(radius)
  const y = useMotionValue(radius / 2)
  const glow = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)`

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }

  return (
    <div
      onPointerMove={onMove}
      className={cn("group relative overflow-hidden rounded-lg border bg-card text-card-foreground", className)}
    >
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-(--duration-base) ease-(--ease-standard)",
          reduce ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        style={{ background: glow }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
