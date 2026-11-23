// Hand-written with Motion. Brutalist signature effect.
// Usage: <HardShadowPress onClick={...}>Click</HardShadowPress>
// Button with a hard offset shadow that collapses as it is pressed.
// Reduced motion: the press is instant (no transition).
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"
import { duration } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

export function HardShadowPress({ className, ...props }: HTMLMotionProps<"button">) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      className={cn(
        "border-2 border-border bg-primary px-4 py-2 font-display text-primary-foreground",
        "shadow-[4px_4px_0_0_var(--border)]",
        className,
      )}
      whileHover={reduce ? undefined : { x: -1, y: -1 }}
      whileTap={{ x: 4, y: 4, boxShadow: "0px 0px 0 0 var(--border)" }}
      transition={{ duration: reduce ? 0 : duration.fast }}
      {...props}
    />
  )
}
