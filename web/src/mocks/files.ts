import { delay, http, HttpResponse } from "msw"
import type { RequestHandler } from "msw"

type FileRecord = { id: number; name: string; mime: string; size: number; owner_id: number | null; created_at: string; url: string }

const store: FileRecord[] = []
let nextId = 1

/**
 * Fixtures-mode files API: uploads are kept in memory and served back as object URLs.
 * Register in a screen's `mocks.ts`: `export { fileHandlers as handlers } from "@/mocks/files"`
 * (or spread it into `handlers`).
 */
export const fileHandlers: RequestHandler[] = [
  http.post("*/api/files", async ({ request }) => {
    const file = (await request.formData()).get("file")
    if (!(file instanceof File)) return HttpResponse.json({ detail: "Missing file" }, { status: 422 })
    if (file.size > 20 * 1024 * 1024) return HttpResponse.json({ detail: "File exceeds the 20 MB limit" }, { status: 413 })
    await delay(300)
    const record: FileRecord = {
      id: nextId++,
      name: file.name,
      mime: file.type || "application/octet-stream",
      size: file.size,
      owner_id: null,
      created_at: new Date().toISOString(),
      url: URL.createObjectURL(file),
    }
    store.push(record)
    return HttpResponse.json(record, { status: 201 })
  }),
  http.get("*/api/files", () => HttpResponse.json(store)),
  http.get("*/api/files/:id", ({ params }) => {
    const f = store.find((r) => String(r.id) === params.id)
    return f ? HttpResponse.json(f) : HttpResponse.json({ detail: "File not found" }, { status: 404 })
  }),
  http.delete("*/api/files/:id", ({ params }) => {
    const i = store.findIndex((r) => String(r.id) === params.id)
    if (i >= 0) store.splice(i, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
