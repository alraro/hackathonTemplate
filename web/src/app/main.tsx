import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import "../index.css"
import { Providers } from "./providers"
import { router } from "./routes"

async function start() {
  // Fixtures mode (default): MSW answers /api/* from seed data, so the web runs without the backend.
  if (import.meta.env.VITE_API_MODE !== "live") {
    const { worker } = await import("@/mocks/browser")
    await worker.start({ onUnhandledFrame: "bypass" })
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  )
}

void start()
