// Organic signature effect. Hand-written (inline SVG feTurbulence noise); reads only theme tokens.
// Usage: put <GrainOverlay /> inside a `relative` container; it covers it and ignores pointer events.
// Static, so it needs no change under prefers-reduced-motion.
import { cn } from "@/lib/utils"

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

type GrainOverlayProps = { opacity?: number; className?: string }

export function GrainOverlay({ opacity = 0.12, className }: GrainOverlayProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-10 mix-blend-multiply dark:mix-blend-screen", className)}
      style={{ backgroundImage: NOISE, backgroundSize: "160px 160px", opacity }}
    />
  )
}
