// Hand-written with Motion. Soft/Playful signature effect.
// Usage: <div className="relative"><FloatingBlobs /> ...content...</div>
// Soft blurred blobs drift behind the content, tinted with theme colours.
// Reduced motion: blobs are static.
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const BLOBS = [
  { color: "bg-primary", pos: "-left-10 -top-10 size-64", move: { x: [0, 30, 0], y: [0, 20, 0] }, t: 14 },
  { color: "bg-accent", pos: "-bottom-16 right-0 size-72", move: { x: [0, -30, 0], y: [0, -25, 0] }, t: 18 },
  { color: "bg-secondary", pos: "left-1/2 top-1/3 size-48", move: { x: [0, 20, 0], y: [0, -20, 0] }, t: 16 },
]

export function FloatingBlobs({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={cn("absolute rounded-full opacity-30 blur-3xl", b.color, b.pos)}
          animate={reduce ? undefined : b.move}
          transition={{ duration: b.t, ease: "easeInOut", repeat: Infinity }}
        />
      ))}
    </div>
  )
}
