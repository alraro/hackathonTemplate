import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CameraCaptureProps = { onCapture: (blob: Blob) => void; label?: string }

const isPhone = () => typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches

/** Phones: native camera via `<input capture>`. Desktop: `getUserMedia` in a dialog with a shutter button. */
export function CameraCapture({ onCapture, label = "Take photo" }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [open, setOpen] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setDenied(false)
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) return stream.getTracks().forEach((t) => t.stop())
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {
        if (!cancelled) setDenied(true)
      })
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [open])

  const start = () => {
    if (isPhone() || !navigator.mediaDevices?.getUserMedia) inputRef.current?.click()
    else setOpen(true)
  }

  const shoot = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        setOpen(false)
        onCapture(blob)
      },
      "image/jpeg",
      0.92,
    )
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={start}>
        <Camera aria-hidden /> {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onCapture(f)
          e.target.value = ""
        }}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>Point the camera and press the shutter.</DialogDescription>
          </DialogHeader>
          {denied ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-6 text-center text-sm">
              <p>Camera access is not available. You can choose a photo from your files instead.</p>
              <Button
                type="button"
                onClick={() => {
                  setOpen(false)
                  inputRef.current?.click()
                }}
              >
                Choose a file
              </Button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-muted" />
              <Button type="button" onClick={shoot}>
                <Camera aria-hidden /> Shutter
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
