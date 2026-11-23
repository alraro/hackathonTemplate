/** `browser` (default): speechSynthesis. Anything else: the server TTS at /api/llm/speak. Mirrors TTS_PROVIDER. */
const TTS_PROVIDER: string = import.meta.env.VITE_TTS_PROVIDER ?? "browser"

function speakInBrowser(text: string) {
  if (typeof speechSynthesis === "undefined") return
  speechSynthesis.cancel()
  speechSynthesis.speak(new SpeechSynthesisUtterance(text))
}

/** Speaks `text` aloud. Resolves when playback was started. */
export async function speak(text: string): Promise<void> {
  if (!text.trim()) return
  if (TTS_PROVIDER === "browser") return speakInBrowser(text)
  const res = await fetch("/api/llm/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  // 204: the server has no TTS (it is set to browser): fall back to speechSynthesis.
  if (res.status === 204 || !res.ok) return speakInBrowser(text)
  const url = URL.createObjectURL(await res.blob())
  const audio = new Audio(url)
  audio.onended = () => URL.revokeObjectURL(url)
  await audio.play()
}
