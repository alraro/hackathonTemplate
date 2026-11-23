import { useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getToken } from "@/lib/api/client"
import { useSocket } from "./useSocket"

type Options<T> = {
  onMessage?: (data: T) => void
  /** Query key to invalidate on each message. Default: queries whose key starts with `topic`. */
  invalidate?: readonly unknown[] | false
  enabled?: boolean
}

/**
 * Subscribe to a topic of `/api/ws`. Returns `send` (publishes to the topic) and `status`.
 * Messages on the topic invalidate matching queries (`queryKey: [topic]`) and call `onMessage`.
 */
export function useChannel<T = unknown>(topic: string, { onMessage, invalidate, enabled = true }: Options<T> = {}) {
  const queryClient = useQueryClient()
  const token = getToken()
  const latest = useRef({ onMessage, invalidate })
  latest.current = { onMessage, invalidate }

  const { send: sendRaw, status } = useSocket(`/api/ws${token ? `?token=${encodeURIComponent(token)}` : ""}`, {
    enabled,
    onOpen: (send) => send(JSON.stringify({ op: "subscribe", topic })),
    onMessage: (raw) => {
      let msg: { topic?: string; data?: T }
      try {
        msg = JSON.parse(raw)
      } catch {
        return
      }
      if (msg.topic !== topic) return
      const { invalidate: key = [topic], onMessage: cb } = latest.current
      if (key) void queryClient.invalidateQueries({ queryKey: key })
      cb?.(msg.data as T)
    },
  })

  const send = useCallback((data: unknown) => sendRaw(JSON.stringify({ op: "publish", topic, data })), [sendRaw, topic])
  return { send, status }
}
