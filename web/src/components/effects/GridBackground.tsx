// Dark Tech signature effect. Hand-written with Motion; reads only theme tokens.
// Usage: <GridBackground className="min-h-80">...content...</GridBackground>
// Honors prefers-reduced-motion (no drift). Max one effect per screen in product use.
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type GridBackgroundProps = { size?: number; className?: string; children?: ReactNode }

export function GridBackground({ size = 40, className, children }: GridBackgroundProps) {
  const reduce = useReducedMotion()
  const line = "color-mix(in oklab, var(--foreground) 9%, transparent)"
  const fade = "radial-gradient(ellipse at center, black 30%, transparent 75%)"
  return (
    <div className={cn("relative isolate overflow-hidden bg-background", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        <motion.div
          className="absolute"
          style={{
            inset: -size,
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: `${size}px ${size}px`,
          }}
          animate={reduce ? undefined : { x: [0, size], y: [0, size] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
