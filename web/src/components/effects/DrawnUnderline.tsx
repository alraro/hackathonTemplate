// Hand-written with Motion. Editorial signature effect.
// Usage: <DrawnUnderline>important phrase</DrawnUnderline>
// A hand-drawn line draws itself under the text in the primary colour.
// Reduced motion: the line is shown fully drawn.
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { duration, easing } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

export function DrawnUnderline({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full text-primary"
      >
        <motion.path
          d="M1 5 Q 20 1, 40 5 T 79 4 T 99 5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: duration.slow * 2, ease: [...easing.standard] }}
        />
      </svg>
    </span>
  )
}
