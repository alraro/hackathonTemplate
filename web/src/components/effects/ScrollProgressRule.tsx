// Hand-written with Motion. Editorial signature effect.
// Usage: <ScrollProgressRule /> once in the layout; a thin rule at the top fills as the page scrolls.
// Reduced motion: no animation, the rule follows scroll without smoothing.
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"
import { spring } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

export function ScrollProgressRule({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass })
  return (
    <motion.div
      aria-hidden
      className={cn("fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary", className)}
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
    />
  )
}
