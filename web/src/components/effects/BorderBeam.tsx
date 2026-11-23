// Dark Tech signature effect. Hand-written with Motion (idea after Magic UI's Border Beam); reads only theme tokens.
// Usage: <BorderBeam className="p-6">...content...</BorderBeam>
// A light travels around the border. Under prefers-reduced-motion the border shows a static primary ring.
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type BorderBeamProps = { periodSeconds?: number; beamSize?: number; className?: string; children?: ReactNode }

const RING_MASK = "linear-gradient(transparent, transparent), linear-gradient(#000, #000)"

export function BorderBeam({ periodSeconds = 6, beamSize = 80, className, children }: BorderBeamProps) {
  const reduce = useReducedMotion()
  return (
    <div className={cn("relative rounded-lg border bg-card text-card-foreground", className)}>
      {/* ring layer: the mask leaves only the 1px border area visible */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent"
        style={{
          mask: RING_MASK,
          maskClip: "padding-box, border-box",
          maskComposite: "intersect",
          WebkitMask: RING_MASK,
          WebkitMaskClip: "padding-box, border-box",
          WebkitMaskComposite: "xor",
        }}
      >
        {reduce ? (
          <div
            className="absolute inset-0"
            style={{ background: "color-mix(in oklab, var(--primary) 45%, transparent)" }}
          />
        ) : (
          <motion.div
            className="absolute aspect-square"
            style={{
              width: beamSize,
              offsetPath: "rect(0 auto auto 0 round var(--radius))",
              background:
                "linear-gradient(to left, var(--primary), color-mix(in oklab, var(--primary) 40%, transparent), transparent)",
            }}
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: periodSeconds, ease: "linear", repeat: Infinity }}
          />
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
