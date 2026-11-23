// Hand-written with Motion. Brutalist signature effect.
// Usage: <Marquee items={["NEW", "LOUD", "RAW"]} /> for a full-width scrolling ticker.
// Reduced motion: static, wrapping row of the items.
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export function Marquee({
  items,
  speed = 20,
  className,
}: {
  items: string[]
  speed?: number // seconds per loop
  className?: string
}) {
  const reduce = useReducedMotion()
  const row = (
    <span className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </span>
  )
  if (reduce)
    return (
      <div className={cn("flex flex-wrap gap-x-8 border-y-2 border-border py-2 font-display uppercase", className)}>
        {items.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    )
  return (
    <div className={cn("flex overflow-hidden border-y-2 border-border py-2 font-display uppercase", className)}>
      <motion.div
        className="flex shrink-0"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {row}
        {row}
      </motion.div>
    </div>
  )
}
