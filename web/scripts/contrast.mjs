// WCAG contrast check for every text/background pair in theme.json (light + dark).
// Exits 1 with the failing pairs. Thresholds: 4.5:1 text, 3:1 large text / UI.
import { readFileSync } from 'node:fs'
import { formatHex, parse, rgb } from 'culori'

const theme = JSON.parse(readFileSync(new URL('../src/design/theme.json', import.meta.url), 'utf8'))

// [foreground, background, minimum ratio]
const PAIRS = [
  ['foreground', 'background', 4.5],
  ['card-foreground', 'card', 4.5],
  ['popover-foreground', 'popover', 4.5],
  ['primary-foreground', 'primary', 4.5],
  ['secondary-foreground', 'secondary', 4.5],
  ['muted-foreground', 'background', 4.5],
  ['muted-foreground', 'muted', 4.5],
  ['accent-foreground', 'accent', 4.5],
  ['destructive', 'background', 3],
]

const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)

// Composite over the colour underneath so alpha colours get a real luminance.
function toRgb(value, under) {
  const c = rgb(parse(value))
  const a = c.alpha ?? 1
  const mix = (k) => Math.min(1, Math.max(0, c[k])) * a + (under?.[k] ?? 1) * (1 - a)
  return { r: mix('r'), g: mix('g'), b: mix('b') }
}

const luminance = ({ r, g, b }) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

function ratio(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)]
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const failures = []
for (const [mode, colors] of Object.entries(theme.colors)) {
  const page = toRgb(colors.background)
  for (const [fgName, bgName, min] of PAIRS) {
    if (!colors[fgName] || !colors[bgName]) continue
    const bg = toRgb(colors[bgName], page)
    const fg = toRgb(colors[fgName], bg)
    const r = ratio(fg, bg)
    if (r < min) {
      failures.push(`${mode}: ${fgName} on ${bgName} = ${r.toFixed(2)}:1 (need ${min}:1) ${formatHex(rgb(parse(colors[fgName])))} / ${formatHex(rgb(parse(colors[bgName])))}`)
    }
  }
}

if (failures.length) {
  console.error('contrast: failing pairs in theme.json')
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log('contrast: all theme.json pairs pass')
