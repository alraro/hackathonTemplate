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

// Theme sources live in the root design/ folder (never pruned). docker-compose mounts it at /design, which is
// ../design from /app, the same relative path as on the host. Import it in code as `@design/...`.
const designDir = path.resolve(import.meta.dirname, "../design")

// PWA: name from identity.json, colours from theme.json. `make theme` writes public/icon.svg (monogram of the
// Identity initial on `primary`); pwaAssets turns it into PNG 192/512 + maskable at build.
const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(designDir, p), "utf8"))
const identity = readJson("identity.json")
const light = readJson("theme.json").colors.light
const hex = (c: string) => formatHex(parse(c)) ?? "#000000"

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
      "@design": designDir,
      ...(featuresPath ? { "@features": featuresPath } : {}),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: { usePolling: process.env.DEV_POLLING === "true" },
    fs: { allow: [".", ".."] },
    // Live mode calls /api on the same origin (client baseUrl ""); forward it to the backend
    // like the Caddy edge does in demo/share. ws: true covers /api/ws and the chat socket.
    proxy: {
      "/api": { target: process.env.API_PROXY_TARGET ?? "http://backend:8000", changeOrigin: true, ws: true },
    },
  },
})
