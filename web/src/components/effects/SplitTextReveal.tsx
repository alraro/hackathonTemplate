// Hand-written with Motion. Editorial signature effect.
// Usage: <SplitTextReveal text="Headline words" className="font-display text-5xl" />
// Words rise and fade in one after another. Reduced motion: plain text, no animation.
import { motion, useReducedMotion } from "motion/react"
import { duration, easing } from "@/design/generated/motion"
import { cn } from "@/lib/utils"

export function SplitTextReveal({
  text,
  className,
  stagger = 0.06,
}: {
  text: string
  className?: string
  stagger?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <span className={className}>{text}</span>
  return (
    <span className={cn("inline-block", className)} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: duration.slow, ease: [...easing.emphasized], delay: i * stagger }}
          >
            {word}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
