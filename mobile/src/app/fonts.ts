import { Inter_400Regular } from "@expo-google-fonts/inter"
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono"
import { fonts } from "../../theme"

/**
 * Font files by theme font family (theme.ts `fonts`). Metro needs static imports, so each family
 * the active theme.json uses is listed here, from its `@expo-google-fonts/<family>` package.
 * Add a line when the Design Phase changes fonts (see MODULE.md, "Change fonts").
 */
const available: Record<string, number> = {
  "Inter Variable": Inter_400Regular,
  "JetBrains Mono Variable": JetBrainsMono_400Regular,
}

const wanted = [...new Set(Object.values(fonts))]

for (const family of wanted) {
  if (!(family in available)) {
    console.warn(`Font "${family}" has no @expo-google-fonts mapping in src/app/fonts.ts; using the system font.`)
  }
}

/** Only the families the theme names and we can load; the rest fall back to the system font. */
export const fontFiles: Record<string, number> = Object.fromEntries(
  wanted.filter((f) => f in available).map((f) => [f, available[f]]),
)
