// Warn-only design lint: banned patterns from the design "Never" list, then ESLint jsx-a11y.
// Always exits 0.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, relative } from 'node:path'

const root = new URL('../src/', import.meta.url).pathname
const RULES = [
  [/from-purple-\d+[^"'`]*to-blue|from-purple[^"'`]*to-blue/, 'purple-to-blue gradient'],
  [/rounded-2xl/, 'rounded-2xl (use theme radius)'],
  [/#[0-9a-fA-F]{3,8}\b|\brgba?\(/, 'raw hex/rgb colour (use theme tokens)'],
  [/font-\[Inter\]/, 'font-[Inter] (use font tokens)'],
]
const EMOJI = /\p{Extended_Pictographic}/u

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (p.includes('/design/generated')) return []
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx|jsx)$/.test(p) ? [p] : []
  })

let warnings = 0
for (const file of walk(root)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const where = `${relative(process.cwd(), file)}:${i + 1}`
    for (const [re, msg] of RULES) if (re.test(line)) { console.warn(`warn ${where} ${msg}`); warnings++ }
    if (EMOJI.test(line) && !/^\s*(import|\/\/)/.test(line)) { console.warn(`warn ${where} emoji in JSX text`); warnings++ }
  })
}

const lint = spawnSync('npx', ['--no-install', 'eslint', 'src'], { stdio: 'inherit' })
if (lint.error || (lint.status !== 0 && lint.status !== 1)) console.warn('warn eslint did not run (npm install?)')
else if (lint.status === 1) warnings++

console.log(`design-lint: ${warnings} warning(s) (warn-only)`)
process.exit(0)
