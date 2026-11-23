import { http, HttpResponse, type RequestHandler } from "msw"

type Row = Record<string, unknown> & { id?: string | number }

/**
 * In-memory CRUD handlers over a fixtures array, mounted at `base` (e.g. `/api/items`):
 *   GET base            -> { items, total }; `q` (substring on any string field), `limit`, `offset`,
 *                          and any other query param as an equality filter
 *   GET base/:id        -> row or 404
 *   POST base           -> creates, assigns an id
 *   PATCH/PUT base/:id  -> merges
 *   DELETE base/:id     -> removes
 * Per-screen handlers override these: export them from `screens/<id>/mocks.ts`.
 */
export function crudFromFixtures(base: string, fixtures: Row[]): RequestHandler[] {
  const rows: Row[] = fixtures.map((r) => ({ ...r }))
  const find = (id: string) => rows.findIndex((r) => String(r.id) === id)
  let next = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1

  return [
    http.get(base, ({ request }) => {
      const { q, limit, offset, ...filters } = Object.fromEntries(new URL(request.url).searchParams)
      let out = rows.filter((r) => Object.entries(filters).every(([k, v]) => String(r[k]) === v))
      if (q) {
        const needle = q.toLowerCase()
        out = out.filter((r) => Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(needle)))
      }
      const start = Number(offset) || 0
      const page = limit ? out.slice(start, start + Number(limit)) : out.slice(start)
      return HttpResponse.json({ items: page, total: out.length })
    }),
    http.get(`${base}/:id`, ({ params }) => {
      const i = find(String(params.id))
      return i < 0 ? HttpResponse.json({ detail: "Not found" }, { status: 404 }) : HttpResponse.json(rows[i])
    }),
    http.post(base, async ({ request }) => {
      const row = { ...((await request.json()) as Row), id: next++ }
      rows.push(row)
      return HttpResponse.json(row, { status: 201 })
    }),
    ...(["patch", "put"] as const).map((method) =>
      http[method](`${base}/:id`, async ({ request, params }) => {
        const i = find(String(params.id))
        if (i < 0) return HttpResponse.json({ detail: "Not found" }, { status: 404 })
        rows[i] = { ...rows[i], ...((await request.json()) as Row), id: rows[i].id }
        return HttpResponse.json(rows[i])
      }),
    ),
    http.delete(`${base}/:id`, ({ params }) => {
      const i = find(String(params.id))
      if (i < 0) return HttpResponse.json({ detail: "Not found" }, { status: 404 })
      rows.splice(i, 1)
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
