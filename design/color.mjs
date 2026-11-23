// Dependency-free oklch -> sRGB, so `make theme` runs in a bare node container (no npm install).
// Same maths and rounding as culori 4 (oklch -> oklab -> linear sRGB -> sRGB), so outputs match it.

const OKLCH = /^oklch\(\s*([0-9.]+)(%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*\/\s*([0-9.]+)(%?))?\s*\)$/

/** Parse an `oklch(L C H [/ A])` string (the form preset.schema.json allows). Returns null if it is not one. */
export function parseOklch(value) {
  const m = OKLCH.exec(String(value).trim())
  if (!m) return null
  const num = (s) => (Number.isFinite(Number(s)) ? Number(s) : NaN)
  const c = { l: num(m[1]) / (m[2] ? 100 : 1), c: num(m[3]), h: num(m[4]) }
  if (m[5] !== undefined) c.alpha = num(m[5]) / (m[6] ? 100 : 1)
  return Object.values(c).some(Number.isNaN) ? null : c
}

const gamma = (v) => {
  const abs = Math.abs(v)
  return abs > 0.0031308 ? (Math.sign(v) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055) : v * 12.92
}

/** Unclamped sRGB channels in 0..1, plus alpha (default 1). Throws on a non-oklch value. */
export function toRgb(value) {
  const p = parseOklch(value)
  if (!p) throw new Error(`not a valid oklch colour: ${value}`)
  const a = p.c ? p.c * Math.cos((p.h / 180) * Math.PI) : 0
  const b = p.c ? p.c * Math.sin((p.h / 180) * Math.PI) : 0
  const L = Math.pow(p.l + 0.3963377773761749 * a + 0.2158037573099136 * b, 3)
  const M = Math.pow(p.l - 0.1055613458156586 * a - 0.0638541728258133 * b, 3)
  const S = Math.pow(p.l - 0.0894841775298119 * a - 1.2914855480194092 * b, 3)
  return {
    r: gamma(4.0767416360759574 * L - 3.3077115392580616 * M + 0.2309699031821044 * S),
    g: gamma(-1.2684379732850317 * L + 2.6097573492876887 * M - 0.3413193760026573 * S),
    b: gamma(-0.0041960761386756 * L - 0.7034186179359362 * M + 1.7076146940746117 * S),
    alpha: p.alpha ?? 1,
  }
}

const byte = (v) => Math.round(Math.max(0, Math.min(1, v || 0)) * 255)
const hex2 = (n) => n.toString(16).padStart(2, "0")

/** `#rrggbb`, or `#rrggbbaa` when `withAlpha` and the colour is not opaque. */
export function toHex(value, withAlpha = false) {
  const { r, g, b, alpha } = toRgb(value)
  const base = `#${hex2(byte(r))}${hex2(byte(g))}${hex2(byte(b))}`
  return withAlpha && byte(alpha) !== 255 ? base + hex2(byte(alpha)) : base
}
