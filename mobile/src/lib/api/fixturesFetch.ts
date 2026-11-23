type Row = Record<string, unknown> & { id?: string | number }

const tables = new Map<string, Row[]>()

/**
 * Register a screen's fixtures at its API base, e.g.
 *   registerFixtures("/api/items", require("../../screens/items/fixtures.json"))
 * Call it from `screens/<x>/api.ts`. Rows are copied, so edits live in memory only.
 */
export function registerFixtures(base: string, fixtures: Row[]) {
  const rows = fixtures.map((r) => ({ ...r }))
  let next = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
  for (const r of rows) if (r.id === undefined) r.id = next++
  tables.set(base, rows)
}

const json = (body: unknown, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

/**
 * `fetch` replacement for openapi-fetch (`createClient({ fetch })`) that answers from registered
 * fixtures, same semantics as the web MSW CRUD handlers:
 *   GET base -> { items, total } (`q`, `limit`, `offset`, other params as equality filters)
 *   GET base/:id, POST base, PATCH|PUT base/:id, DELETE base/:id
 * Unregistered paths answer 404.
 */
export async function fixturesFetch(input: Request | string | URL, init?: RequestInit): Promise<Response> {
  const request = input instanceof Request ? input : new Request(input, init)
  const url = new URL(request.url)
  const method = request.method.toUpperCase()
  const notFound = () => json({ detail: "Not found" }, 404)

  const path = url.pathname.replace(/\/+$/, "")
  const slash = path.lastIndexOf("/")
  const parent = path.slice(0, slash)
  const rows = tables.get(path) ?? tables.get(parent)
  if (!rows) return notFound()
  const isCollection = tables.has(path)
  const idOf = (r: Row) => String(r.id)
  const index = () => rows.findIndex((r) => idOf(r) === path.slice(slash + 1))

  if (isCollection) {
    if (method === "GET") {
      const { q, limit, offset, ...filters } = Object.fromEntries(url.searchParams)
      let out = rows.filter((r) => Object.entries(filters).every(([k, v]) => String(r[k]) === v))
      if (q) {
        const needle = q.toLowerCase()
        out = out.filter((r) => Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(needle)))
      }
      const start = Number(offset) || 0
      const page = limit ? out.slice(start, start + Number(limit)) : out.slice(start)
      return json({ items: page, total: out.length })
    }
    if (method === "POST") {
      const next = rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
      const row = { ...((await request.json()) as Row), id: next }
      rows.push(row)
      return json(row, 201)
    }
    return notFound()
  }

  const i = index()
  if (i < 0) return notFound()
  if (method === "GET") return json(rows[i])
  if (method === "PATCH" || method === "PUT") {
    rows[i] = { ...rows[i], ...((await request.json()) as Row), id: rows[i].id }
    return json(rows[i])
  }
  if (method === "DELETE") {
    rows.splice(i, 1)
    return json(null, 204)
  }
  return notFound()
}
