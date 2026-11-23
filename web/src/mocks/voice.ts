import { delay, http, HttpResponse } from "msw"
import type { RequestHandler } from "msw"

/**
 * Fixtures-mode voice API: a canned transcript, and 204 for speak (the browser speaks).
 * Register in a screen's `mocks.ts`: `export { voiceHandlers as handlers } from "@/mocks/voice"`
 * (or spread it into `handlers`).
 */
export const voiceHandlers: RequestHandler[] = [
  http.post("*/api/llm/transcribe", async () => {
    await delay(400)
    return HttpResponse.json({ text: "Hello, this is a sample voice transcript." })
  }),
  http.post("*/api/llm/speak", () => new HttpResponse(null, { status: 204 })),
]
