// Organic signature effect. Hand-written with Motion; reads only theme tokens (color via currentColor, default text-secondary).
// Usage: <WavyDivider className="text-secondary" /> between sections.
// The wave drifts sideways. Under prefers-reduced-motion it stays still.
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const PERIOD = 120
const REPEATS = 16
// One crest-and-trough period is a quadratic curve plus a smooth continuation, repeated across the width.
const PATH = `M0 12 q${PERIOD / 4} -12 ${PERIOD / 2} 0 ${Array.from({ length: REPEATS * 2 - 1 }, () => `t${PERIOD / 2} 0`).join(" ")} V24 H0 Z`

type WavyDividerProps = { flip?: boolean; className?: string }

export function WavyDivider({ flip, className }: WavyDividerProps) {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className={cn("w-full overflow-hidden leading-[0] text-secondary", flip && "rotate-180", className)}>
      <motion.svg
        width={PERIOD * REPEATS}
        height={24}
        viewBox={`0 0 ${PERIOD * REPEATS} 24`}
        className="block max-w-none"
        animate={reduce ? undefined : { x: [0, -PERIOD] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      >
        <path d={PATH} fill="currentColor" />
      </motion.svg>
    </div>
  )
}
