// Applies a design preset (see design/preset.schema.json) to the document at runtime by setting
// the same CSS variables that design/generated/theme.css defines. Used by /showcase for live comparison.
export type Preset = {
  name: string
  fonts: Record<"display" | "body" | "mono", { family: string }>
  colors: { light: Record<string, string>; dark?: Record<string, string> }
  radius: string
  shadow: Record<string, string>
  effects: string[]
}

const FALLBACK = {
  display: "ui-sans-serif, system-ui, sans-serif",
  body: "ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, monospace",
}

/** Sets the preset's variables inline on <html>. Returns a function that removes them again. */
export function applyPreset(preset: Preset, root: HTMLElement = document.documentElement): () => void {
  const vars: Record<string, string> = {}
  const dark = root.classList.contains("dark")
  const palette = (dark && preset.colors.dark) || preset.colors.light
  for (const [k, v] of Object.entries(palette)) vars[`--${k}`] = v
  vars["--radius"] = preset.radius
  for (const [k, v] of Object.entries(preset.shadow)) vars[`--shadow-${k}-value`] = v
  for (const k of ["display", "body", "mono"] as const) {
    vars[`--font-${k}-family`] = `"${preset.fonts[k].family}", ${FALLBACK[k]}`
  }
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  return () => {
    for (const k of Object.keys(vars)) root.style.removeProperty(k)
  }
}
