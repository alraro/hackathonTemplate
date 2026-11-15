import fs from "node:fs"
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Root features.json: docker-compose mounts it at /app/features.json, on the host it is ../features.json.
// Import it in code as `import features from "@features"`.
const featuresPath = [path.resolve(import.meta.dirname, "features.json"), path.resolve(import.meta.dirname, "../features.json")].find((p) =>
  fs.existsSync(p),
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
