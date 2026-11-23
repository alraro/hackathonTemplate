// Dark Tech signature effect. Hand-written; reads only theme tokens (font-mono, inherits color).
// Usage: <DecryptText text="Access granted" className="text-primary" />
// Scrambles characters, then resolves left to right. Under prefers-reduced-motion it renders the final text at once.
import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const GLYPHS = "!<>-_\\/[]{}=+*^?#01"

type DecryptTextProps = { text: string; durationMs?: number; className?: string }

export function DecryptText({ text, durationMs = 900, className }: DecryptTextProps) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (reduce) {
      setShown(text)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      const resolved = Math.floor(t * text.length)
      setShown(
        text
          .split("")
          .map((ch, i) => (i < resolved || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      )
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, durationMs, reduce])

  return (
    <span className={cn("font-mono", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  )
}
