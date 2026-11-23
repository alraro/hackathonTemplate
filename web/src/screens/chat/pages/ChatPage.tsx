import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Send, Square, TriangleAlert } from "lucide-react"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Markdown } from "../components/Markdown"
import { useChat } from "../useChat"

const SUGGESTIONS = ["What can you help me with?", "Summarize this project in three bullets", "Write a haiku about hackathons"]

// Screen pattern: socket state lives in `useChat`; the page only renders it. Errors show inline with a retry.
export default function ChatPage() {
  const { messages, streaming, status, useRag, setUseRag, send, retry, stop } = useChat()
  const [draft, setDraft] = useState("")
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" }) // instant: no smooth animation, respects reduced motion
  }, [messages])

  const submit = (text = draft) => {
    if (send(text)) setDraft("")
  }
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <PageHeader title="Chat" />
      <div className="flex-1 space-y-4 overflow-y-auto py-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Ask anything to get started.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" className="rounded-full" disabled={status !== "open"} onClick={() => submit(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground whitespace-pre-wrap" : "bg-muted"}`}>
                {m.role === "user" ? m.content : m.content ? <Markdown>{m.content}</Markdown> : !m.error && <span className="text-muted-foreground">...</span>}
                {m.citations?.length ? (
                  <ul className="mt-2 space-y-1 border-t pt-2 text-xs text-muted-foreground">
                    {m.citations.map((c, j) => (
                      <li key={j}>
                        [{j + 1}] {c.title ?? c.source}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {m.error ? (
                  <div role="alert" className="mt-2 flex items-center gap-2 text-destructive">
                    <TriangleAlert className="size-4" aria-hidden />
                    <span>{m.error}</span>
                    {i === messages.length - 1 ? (
                      <Button size="sm" variant="outline" onClick={retry}>
                        Retry
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
        <div ref={bottom} />
      </div>
      <form
        className="sticky bottom-0 space-y-2 border-t bg-background pt-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Message (Enter to send, Shift+Enter for a new line)"
            aria-label="Message"
            className="min-h-10 flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {streaming ? (
            <Button type="button" variant="outline" onClick={stop}>
              <Square aria-hidden /> Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!draft.trim() || status !== "open"}>
              <Send aria-hidden /> Send
            </Button>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={useRag} onChange={(e) => setUseRag(e.target.checked)} /> Answer from documents (RAG)
        </label>
      </form>
    </div>
  )
}
