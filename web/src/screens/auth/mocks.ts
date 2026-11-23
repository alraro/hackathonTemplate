import { http, HttpResponse } from "msw"
import fixtures from "./fixtures.json"

// Fixtures mode: any credentials are accepted. A known email gets its seeded user, anything else a generic one.
type Seed = { email: string; name: string }
type User = { id: number; email: string; name: string; preferences: Record<string, unknown> }
const users = new Map<string, User>()
;(fixtures as Seed[]).forEach((s, i) => users.set(s.email, { id: i + 1, email: s.email, name: s.name, preferences: {} }))

const TOKEN = "fixture-token:"
const userFor = (email: string, name?: string) => {
  let u = users.get(email)
  if (!u) {
    u = { id: users.size + 1, email, name: name ?? email.split("@")[0], preferences: {} }
    users.set(email, u)
  }
  return u
}
const fromRequest = (request: Request) => {
  const email = request.headers.get("Authorization")?.replace(`Bearer ${TOKEN}`, "")
  return email ? users.get(email) : undefined
}
const unauthorized = () => HttpResponse.json({ detail: "Not authenticated" }, { status: 401 })

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email } = (await request.json()) as { email: string }
    return HttpResponse.json({ access_token: TOKEN + email, token_type: "bearer", user: userFor(email) })
  }),
  http.post("/api/auth/signup", async ({ request }) => {
    const { email, name } = (await request.json()) as { email: string; name: string }
    return HttpResponse.json({ access_token: TOKEN + email, token_type: "bearer", user: userFor(email, name) })
  }),
  http.get("/api/auth/me", ({ request }) => {
    const u = fromRequest(request)
    return u ? HttpResponse.json(u) : unauthorized()
  }),
  http.patch("/api/auth/me", async ({ request }) => {
    const u = fromRequest(request)
    if (!u) return unauthorized()
    Object.assign(u, await request.json())
    return HttpResponse.json(u)
  }),
]
