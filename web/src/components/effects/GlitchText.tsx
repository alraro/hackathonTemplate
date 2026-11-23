// Hand-written with Motion. Brutalist signature effect.
// Usage: <GlitchText text="ERROR" className="text-6xl" />
// Two offset copies in primary/accent jitter over the text on hover.
// Reduced motion: plain static text.
import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { duration } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

export function GlitchText({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion()
  const [on, setOn] = useState(false)
  if (reduce) return <span className={className}>{text}</span>
  const layer = (color: string, dx: number) => (
    <motion.span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", color)}
      animate={on ? { x: [0, dx, -dx, dx / 2, 0], y: [0, -1, 1, 0, 0] } : { x: 0, y: 0 }}
      transition={{ duration: duration.base, repeat: on ? Infinity : 0 }}
    >
      {text}
    </motion.span>
  )
  return (
    <span
      className={cn("relative inline-block font-display", className)}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
    >
      {layer("text-primary mix-blend-multiply", -3)}
      {layer("text-accent mix-blend-multiply", 3)}
      <span className="relative">{text}</span>
    </span>
  )
}
