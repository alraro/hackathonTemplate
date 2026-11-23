import { useEffect, useRef, useState } from "react"
import { Loader2, Mic, Square } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/client"

type VoiceButtonProps = { onText: (text: string) => void; language?: string; label?: string }

/** Press to record, press again to stop: the clip is transcribed via `POST /api/llm/transcribe` and `onText` gets the text. */
export function VoiceButton({ onText, language, label = "Speak" }: VoiceButtonProps) {
  const [state, setState] = useState<"idle" | "recording" | "busy">("idle")
  const recorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => () => recorderRef.current?.stream.getTracks().forEach((t) => t.stop()), [])

  const transcribe = async (blob: Blob) => {
    setState("busy")
    try {
      const body = new FormData()
      body.append("file", blob, "voice.webm")
      const { data, error } = await api.POST("/api/llm/transcribe", {
        body: body as never,
        params: { query: { language } },
      })
      if (error || !data) throw new Error("transcribe failed")
      onText(data.text)
    } catch {
      toast.error("Could not transcribe the recording")
    } finally {
      setState("idle")
    }
  }

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice recording is not supported in this browser")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        void transcribe(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }))
      }
      recorder.start()
      recorderRef.current = recorder
      setState("recording")
    } catch {
      toast.error("Microphone access was denied")
    }
  }

  const stop = () => recorderRef.current?.stop()

  return (
    <Button
      type="button"
      variant={state === "recording" ? "destructive" : "outline"}
      disabled={state === "busy"}
      aria-pressed={state === "recording"}
      onClick={state === "recording" ? stop : start}
    >
      {state === "busy" ? <Loader2 className="animate-spin" aria-hidden /> : state === "recording" ? <Square aria-hidden /> : <Mic aria-hidden />}
      {state === "recording" ? "Stop" : label}
    </Button>
  )
}
