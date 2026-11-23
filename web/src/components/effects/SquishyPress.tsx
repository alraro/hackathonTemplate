// Hand-written with Motion. Soft/Playful signature effect.
// Usage: <SquishyPress onClick={...}>Tap me</SquishyPress>
// Button that squashes and springs back with the theme spring.
// Reduced motion: no scale, only the default button behaviour.
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"
import { spring } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

export function SquishyPress({ className, ...props }: HTMLMotionProps<"button">) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      className={cn("rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-md", className)}
      whileHover={reduce ? undefined : { scale: 1.05 }}
      whileTap={reduce ? undefined : { scaleX: 1.1, scaleY: 0.88 }}
      transition={spring}
      {...props}
    />
  )
}
