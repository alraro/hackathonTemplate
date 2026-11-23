import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState } from "react"
import { API_MODE, API_URL, getToken } from "../api/client"

export type ChannelStatus = "connecting" | "open" | "closed"
export type ChannelOptions = { onMessage?: (data: unknown) => void }

const FAKE_EVERY_MS = 20_000

/**
 * Subscribe to a realtime topic over the backend WebSocket (`/api/ws`), same
 * `{op, topic, data}` / `{topic, data}` envelope as web. Reconnects with backoff and
 * invalidates TanStack queries whose key starts with the topic name (`"items:42"` -> `"items"`).
 * In fixtures mode no socket opens: a fake message arrives every ~20 s.
 */
export function useChannel(topic: string, { onMessage }: ChannelOptions = {}) {
  const qc = useQueryClient()
  const [status, setStatus] = useState<ChannelStatus>("closed")
  const socket = useRef<WebSocket | null>(null)
  const handler = useRef(onMessage)
  handler.current = onMessage

  useEffect(() => {
    const name = topic.split(":")[0]
    const deliver = (data: unknown) => {
      handler.current?.(data)
      qc.invalidateQueries({ queryKey: [name] })
    }

    if (API_MODE === "fixtures") {
      setStatus("open")
      const id = setInterval(
        () => deliver({ title: "Fixture message", body: `Fake update on ${topic}`, fake: true }),
        FAKE_EVERY_MS,
      )
      return () => clearInterval(id)
    }

    let stopped = false
    let attempt = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const wsBase = API_URL.replace(/^http/, "ws")

    const connect = () => {
      setStatus("connecting")
      const ws = new WebSocket(`${wsBase}/api/ws?token=${encodeURIComponent(getToken() ?? "")}`)
      socket.current = ws
      ws.onopen = () => {
        attempt = 0
        setStatus("open")
        ws.send(JSON.stringify({ op: "subscribe", topic }))
      }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(String(e.data)) as { topic: string; data: unknown }
          if (msg.topic === topic) deliver(msg.data)
        } catch {
          /* ignore malformed frames */
        }
      }
      ws.onclose = () => {
        socket.current = null
        setStatus("closed")
        if (stopped) return
        timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempt++))
      }
      ws.onerror = () => ws.close()
    }
    connect()

    return () => {
      stopped = true
      clearTimeout(timer)
      socket.current?.close()
      socket.current = null
    }
  }, [topic, qc])

  const send = useCallback(
    (data: unknown) => {
      const ws = socket.current
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: "publish", topic, data }))
    },
    [topic],
  )

  return { send, status }
}
