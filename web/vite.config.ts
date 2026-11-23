import fs from "node:fs"
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import { formatHex, parse } from "culori"

// Root features.json: docker-compose mounts it at /app/features.json, on the host it is ../features.json.
// Import it in code as `import features from "@features"`.
const featuresPath = [path.resolve(import.meta.dirname, "features.json"), path.resolve(import.meta.dirname, "../features.json")].find((p) =>
  fs.existsSync(p),
)

// PWA: name from identity.json, colours from theme.json. icon.svg is rewritten on every config load
// (monogram of the Identity initial on `primary`); pwaAssets turns it into PNG 192/512 + maskable at build.
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, p), "utf8"))
const identity = readJson("src/design/identity.json")
const light = readJson("src/design/theme.json").colors.light
const hex = (c: string) => formatHex(parse(c)) ?? "#000000"
const initial = (Array.from(String(identity.name).trim())[0] ?? "A").toUpperCase().replace(/[<>&]/g, "")
fs.writeFileSync(
  path.resolve(import.meta.dirname, "public/icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${hex(light.primary)}"/><text x="256" y="256" fill="${hex(light["primary-foreground"])}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="300" text-anchor="middle" dominant-baseline="central">${initial}</text></svg>\n`,
)

export default defineConfig({
  plugins: [
    react(),
    // The page title comes from identity.json too.
    { name: "identity-title", transformIndexHtml: (html: string) => html.replace(/<title>.*<\/title>/, `<title>${String(identity.name).replace(/[<>&]/g, "")}</title>`) },
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      pwaAssets: { image: "public/icon.svg", preset: "minimal-2023" },
      includeAssets: ["icon.svg"],
      manifest: {
        name: identity.name,
        short_name: String(identity.name).slice(0, 12),
        description: identity.tagline,
        theme_color: hex(light.primary),
        background_color: hex(light.background),
        display: "standalone",
        start_url: "/",
      },
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"], navigateFallback: "/index.html", globIgnores: ["mockServiceWorker.js"], navigateFallbackDenylist: [/^\/api/] },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      ...(featuresPath ? { "@features": featuresPath } : {}),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: { usePolling: process.env.DEV_POLLING === "true" },
    fs: { allow: [".", ".."] },
  },
})
