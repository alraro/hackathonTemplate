import { useCallback, useEffect, useRef, useState } from "react"

export type SocketStatus = "connecting" | "open" | "closed"

type Options = {
  onMessage?: (data: string) => void
  /** Called on every (re)connect, e.g. to resubscribe. */
  onOpen?: (send: (data: string) => void) => void
  /** Called when an open socket drops (not on a deliberate close). */
  onClose?: () => void
  /** Set false to stay disconnected. */
  enabled?: boolean
}

/** Resolves a path like `/api/ws` to a ws(s) URL on the current origin. */
export function wsUrl(path: string): string {
  if (/^wss?:/.test(path)) return path
  return `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${path}`
}

/**
 * Low-level WebSocket hook with auto-reconnect (exponential backoff, max 15 s).
 * Shared by `useChannel` and chat. `send` drops messages while not open.
 */
export function useSocket(url: string, { onMessage, onOpen, onClose, enabled = true }: Options = {}) {
  const [status, setStatus] = useState<SocketStatus>("closed")
  const socket = useRef<WebSocket | null>(null)
  const handlers = useRef({ onMessage, onOpen, onClose })
  handlers.current = { onMessage, onOpen, onClose }

  useEffect(() => {
    if (!enabled) return
    let stopped = false
    let attempt = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      setStatus("connecting")
      const ws = new WebSocket(wsUrl(url))
      socket.current = ws
      ws.onopen = () => {
        attempt = 0
        setStatus("open")
        handlers.current.onOpen?.((d) => ws.send(d))
      }
      ws.onmessage = (e) => handlers.current.onMessage?.(String(e.data))
      ws.onclose = () => {
        if (socket.current === ws) socket.current = null
        if (stopped) return
        setStatus("closed")
        handlers.current.onClose?.()
        timer = setTimeout(connect, Math.min(500 * 2 ** attempt++, 15_000))
      }
    }
    connect()
    return () => {
      stopped = true
      clearTimeout(timer)
      socket.current?.close()
      socket.current = null
      setStatus("closed")
    }
  }, [url, enabled])

  const send = useCallback((data: string) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(data)
  }, [])

  return { send, status }
}
