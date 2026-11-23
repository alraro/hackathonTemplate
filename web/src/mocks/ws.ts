import { ws } from "msw"
import type { RequestHandler } from "msw"

/**
 * Canned WebSocket stream: on connect (or after each client message when `onMessage` is true)
 * sends every message of `stream`, `intervalMs` apart. For chat/realtime in fixtures mode.
 * `url` may be a path like `/ws/chat`; it is matched on any origin.
 */
export function cannedStream(
  url: string,
  stream: unknown[],
  { intervalMs = 400, onMessage = false }: { intervalMs?: number; onMessage?: boolean } = {},
): RequestHandler {
  const link = ws.link(url.startsWith("/") ? `*${url}` : url)
  const play = (send: (data: string) => void) =>
    stream.forEach((m, i) => setTimeout(() => send(typeof m === "string" ? m : JSON.stringify(m)), i * intervalMs))
  return link.addEventListener("connection", ({ client }) => {
    if (onMessage) client.addEventListener("message", () => play((d) => client.send(d)))
    else play((d) => client.send(d))
  }) as unknown as RequestHandler
}

/**
 * `/api/ws` in fixtures mode: after a `subscribe` to `notifications` (or `notifications:<id>`), sends a fake
 * notification every ~20 s so the bell and presence badge work without a backend.
 */
const channel = ws.link("*/api/ws")
const notifications = channel.addEventListener("connection", ({ client }) => {
  let n = 0
  const timers: ReturnType<typeof setInterval>[] = []
  client.addEventListener("message", (event) => {
    let frame: { op?: string; topic?: string }
    try {
      frame = JSON.parse(String(event.data))
    } catch {
      return
    }
    const topic = frame.topic
    if (frame.op !== "subscribe" || !topic?.startsWith("notifications")) return
    timers.push(
      setInterval(() => {
        n += 1
        client.send(JSON.stringify({ topic, data: { id: n, title: `Fake notification ${n}`, body: "Sent by the fixtures mock.", created_at: new Date().toISOString() } }))
      }, 20_000),
    )
  })
  client.addEventListener("close", () => timers.forEach(clearInterval))
}) as unknown as RequestHandler

/** Default WebSocket fixtures; add `cannedStream(...)` entries here or in a screen's `mocks.ts`. */
export const wsHandlers: RequestHandler[] = [notifications]
