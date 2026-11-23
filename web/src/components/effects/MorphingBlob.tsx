// Organic signature effect. Hand-written with Motion; reads only theme tokens.
// Usage: <MorphingBlob className="size-64" /> behind content (aria-hidden, ignores pointer events).
// The shape morphs slowly, paced by the preset's slow duration. Under prefers-reduced-motion it stays still.
import { motion, useReducedMotion } from "motion/react"
import { duration } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

const SHAPES = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 60% 70% 40% / 50% 60% 30% 60%",
  "50% 50% 40% 60% / 40% 70% 30% 60%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
]

type MorphingBlobProps = { className?: string }

export function MorphingBlob({ className }: MorphingBlobProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none bg-gradient-to-br from-primary/35 to-accent blur-xl", className)}
      style={{ borderRadius: SHAPES[0] }}
      animate={reduce ? undefined : { borderRadius: SHAPES, rotate: [0, 20, -10, 0] }}
      transition={{ duration: Math.max(duration.slow * 20, 8), ease: "easeInOut", repeat: Infinity }}
    />
  )
}
