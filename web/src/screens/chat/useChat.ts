import { useCallback, useRef, useState } from "react"
import { getToken } from "@/lib/api/client"
import type { components } from "@/lib/api/schema"
import { useSocket } from "@/lib/realtime/useSocket"

type Schemas = components["schemas"]
export type Citation = Schemas["ChatCitation"]
type ServerFrame = Schemas["ChatFrames"]["server"]

export type Message = {
  role: Schemas["ChatMessage"]["role"]
  content: string
  citations?: Citation[]
  error?: string
}

/** Chat state over `/api/llm/chat/ws`: frames are `{type, ...}`; deltas append to the last assistant message. */
export function useChat() {
  const token = getToken()
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [useRag, setUseRag] = useState(false)
  const history = useRef<Message[]>([])
  history.current = messages
  const live = useRef(false)
  live.current = streaming

  const patchLast = (fn: (m: Message) => Message) =>
    setMessages((all) => (all.length ? [...all.slice(0, -1), fn(all[all.length - 1])] : all))

  const onMessage = useCallback((raw: string) => {
    let frame: ServerFrame
    try {
      frame = JSON.parse(raw)
    } catch {
      return
    }
    if (frame.type === "delta") patchLast((m) => ({ ...m, content: m.content + frame.text }))
    else if (frame.type === "done") {
      patchLast((m) => (frame.citations.length ? { ...m, citations: frame.citations } : m))
      setStreaming(false)
    } else if (frame.type === "error") {
      patchLast((m) => ({ ...m, error: frame.detail }))
      setStreaming(false)
    }
  }, [])

  // A dropped socket ends the stream: show an inline error (with retry) instead of hanging in "streaming".
  const onClose = useCallback(() => {
    if (!live.current) return
    patchLast((m) => ({ ...m, error: "Connection lost" }))
    setStreaming(false)
  }, [])

  const { send: sendRaw, status } = useSocket(`/api/llm/chat/ws${token ? `?token=${encodeURIComponent(token)}` : ""}`, { onMessage, onClose })

  /** Sends `thread` as the request and opens an empty assistant message for the answer. */
  const ask = (thread: Message[]) => {
    const request: Schemas["ChatRequest"] = {
      messages: thread.map(({ role, content }) => ({ role, content })),
      use_rag: useRag,
    }
    setMessages([...thread, { role: "assistant", content: "" }])
    setStreaming(true)
    sendRaw(JSON.stringify(request))
  }

  /** Returns true when the message was sent; false while streaming, empty or the socket is not open. */
  const send = (text: string) => {
    if (streaming || status !== "open" || !text.trim()) return false
    ask([...history.current, { role: "user", content: text.trim() }])
    return true
  }
  /** Re-asks after an error frame: drops the failed assistant message and sends again. */
  const retry = () => {
    const last = history.current[history.current.length - 1]
    if (streaming || status !== "open" || !last?.error) return
    ask(history.current.slice(0, -1))
  }
  const stop = () => sendRaw(JSON.stringify({ type: "stop" } satisfies Schemas["Stop"]))

  return { messages, streaming, status, useRag, setUseRag, send, retry, stop }
}
