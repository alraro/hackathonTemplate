// Hand-written with Motion. Soft/Playful signature effect.
// Usage: <ConfettiBurst>{(fire) => <button onClick={fire}>Done</button>}</ConfettiBurst>
// Calling fire() sends pieces in theme colours outward from the wrapper centre.
// Reduced motion: fire() renders nothing.
import { useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { duration } from "@/design/generated/motion"

const COLORS = ["bg-primary", "bg-accent", "bg-secondary", "bg-destructive"]

export function ConfettiBurst({
  children,
  count = 18,
}: {
  children: (fire: () => void) => ReactNode
  count?: number
}) {
  const reduce = useReducedMotion()
  const [burst, setBurst] = useState(0)
  const fire = () => {
    if (!reduce) setBurst((b) => b + 1)
  }
  return (
    <span className="relative inline-block">
      {children(fire)}
      <AnimatePresence>
        {burst > 0 && (
          <span key={burst} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
            {Array.from({ length: count }, (_, i) => {
              const angle = (i / count) * Math.PI * 2
              const dist = 50 + ((i * 37) % 40)
              return (
                <motion.span
                  key={i}
                  className={`absolute size-2 rounded-sm ${COLORS[i % COLORS.length]}`}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 20, opacity: 0, rotate: 180 }}
                  transition={{ duration: duration.slow * 3 }}
                />
              )
            })}
          </span>
        )}
      </AnimatePresence>
    </span>
  )
}
