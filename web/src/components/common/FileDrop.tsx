import { useEffect, useRef, useState } from "react"
import { FileText, RotateCw, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getToken } from "@/lib/api/client"
import { CameraCapture } from "./CameraCapture"

export type UploadedFile = { id: number; name: string; mime: string; size: number; owner_id: number | null; created_at: string; url: string }

type FileDropProps = {
  onUploaded: (files: UploadedFile[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  /** Ask the backend to ingest the file into RAG (`?ingest=true`). */
  ingest?: boolean
}

type Item = {
  key: number
  file: File
  preview: string | null
  progress: number
  error: string | null
  invalid: boolean
}

let seq = 0

function matches(file: File, accept?: string) {
  if (!accept) return true
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((a) => {
      if (a.startsWith(".")) return file.name.toLowerCase().endsWith(a)
      if (a.endsWith("/*")) return file.type.startsWith(a.slice(0, -1))
      return file.type === a
    })
}

function send(file: File, ingest: boolean, onProgress: (p: number) => void): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `/api/files${ingest ? "?ingest=true" : ""}`)
    const token = getToken()
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onerror = () => reject(new Error("Network error"))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve(JSON.parse(xhr.responseText))
      let msg = `Upload failed (${xhr.status})`
      try {
        const d = JSON.parse(xhr.responseText)?.detail
        if (typeof d === "string") msg = d
      } catch {
        /* keep the default message */
      }
      reject(new Error(msg))
    }
    const body = new FormData()
    body.append("file", file)
    xhr.send(body)
  })
}

/** Drag-and-drop upload block: preview, real progress, per-file error + retry, "take photo". Posts to `/api/files`. */
export function FileDrop({ onUploaded, accept = "image/*,.pdf", maxSize = 20_000_000, multiple = false, ingest = false }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previews = useRef<string[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const urls = previews.current
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const patch = (key: number, p: Partial<Item>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)))

  const upload = async (item: Item) => {
    patch(item.key, { error: null, progress: 0 })
    try {
      const result = await send(item.file, ingest, (progress) => patch(item.key, { progress }))
      patch(item.key, { progress: 100 })
      onUploaded([result])
    } catch (e) {
      patch(item.key, { error: e instanceof Error ? e.message : "Upload failed" })
    }
  }

  const add = (list: FileList | File[]) => {
    const files = Array.from(list)
    const picked = multiple ? files : files.slice(0, 1)
    const fresh = picked.map((file): Item => {
      const error = !matches(file, accept) ? "File type not allowed" : file.size > maxSize ? `File exceeds ${Math.round(maxSize / 1e6)} MB` : null
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      if (preview) previews.current.push(preview)
      return { key: ++seq, file, preview, progress: 0, error, invalid: error !== null }
    })
    setItems((cur) => (multiple ? [...cur, ...fresh] : fresh))
    fresh.filter((i) => !i.invalid).forEach((i) => void upload(i))
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          add(e.dataTransfer.files)
        }}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${dragging ? "border-primary bg-accent" : "border-border hover:bg-accent/50"}`}
      >
        <Upload className="size-6 text-muted-foreground" aria-hidden />
        <span className="font-medium">Drop {multiple ? "files" : "a file"} here or click to browse</span>
        <span className="text-muted-foreground">
          {accept} · up to {Math.round(maxSize / 1e6)} MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          if (e.target.files) add(e.target.files)
          e.target.value = ""
        }}
      />
      <div>
        <CameraCapture
          onCapture={(blob) => add([blob instanceof File ? blob : new File([blob], `photo-${Date.now()}.jpg`, { type: blob.type || "image/jpeg" })])}
        />
      </div>
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((i) => (
            <li key={i.key} className="flex items-center gap-3 rounded-md border p-2">
              {i.preview ? (
                <img src={i.preview} alt="" className="size-10 shrink-0 rounded object-cover" />
              ) : (
                <FileText className="size-10 shrink-0 p-2 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{i.file.name}</p>
                {i.error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {i.error}
                  </p>
                ) : (
                  <div
                    role="progressbar"
                    aria-label={`Uploading ${i.file.name}`}
                    aria-valuenow={i.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-1 h-1.5 overflow-hidden rounded bg-muted"
                  >
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${i.progress}%` }} />
                  </div>
                )}
              </div>
              {i.error && !i.invalid && (
                <Button type="button" size="icon" variant="ghost" aria-label={`Retry ${i.file.name}`} onClick={() => void upload(i)}>
                  <RotateCw aria-hidden />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remove ${i.file.name}`}
                onClick={() => setItems((cur) => cur.filter((x) => x.key !== i.key))}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
