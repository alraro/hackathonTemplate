import { ws } from "msw"
import type { RequestHandler } from "msw"

const ANSWER = [
  "Here is a **short answer** from the canned stream.\n\n",
  "- It arrives in small deltas\n",
  "- It is rendered as *markdown*\n\n",
  "Use the Stop button to cut it short.",
]

/**
 * Fixtures-mode chat socket: each `{messages}` frame replays `ANSWER` as `delta` frames then `done`
 * (with a citation when `use_rag`); a `{type: "stop"}` frame cancels it with `done`.
 */
const link = ws.link("*/api/llm/chat/ws")

export const chatHandlers: RequestHandler[] = [
  link.addEventListener("connection", ({ client }) => {
    let timers: ReturnType<typeof setTimeout>[] = []
    const send = (frame: unknown) => client.send(JSON.stringify(frame))
    client.addEventListener("message", (event) => {
      let frame: { type?: string; use_rag?: boolean }
      try {
        frame = JSON.parse(String(event.data))
      } catch {
        send({ type: "error", detail: "Invalid JSON" })
        return
      }
      if (frame.type === "stop") {
        timers.forEach(clearTimeout)
        timers = []
        send({ type: "done", citations: [] })
        return
      }
      ANSWER.forEach((text, i) => timers.push(setTimeout(() => send({ type: "delta", text }), 300 * (i + 1))))
      const citations = frame.use_rag ? [{ source: "docs/welcome.md", title: "Welcome", text: "Canned citation.", score: 0.9 }] : []
      timers.push(setTimeout(() => send({ type: "done", citations }), 300 * (ANSWER.length + 1)))
    })
  }) as unknown as RequestHandler,
]
