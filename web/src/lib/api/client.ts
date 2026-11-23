import createClient, { type Middleware } from "openapi-fetch"
import type { paths } from "./schema"

export const SESSION_TOKEN_KEY = "session_token"

/** `fixtures` (default): MSW answers from seed data. `live`: requests reach the backend. */
export const API_MODE: "fixtures" | "live" = import.meta.env.VITE_API_MODE === "live" ? "live" : "fixtures"

export function getToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(SESSION_TOKEN_KEY, token)
    else localStorage.removeItem(SESSION_TOKEN_KEY)
  } catch {
    /* storage unavailable: session stays in memory only */
  }
}

const auth: Middleware = {
  onRequest({ request }) {
    const token = getToken()
    if (token) request.headers.set("Authorization", `Bearer ${token}`)
    return request
  },
}

/** Typed client; paths are relative (`/api/...`), the same in both modes. */
export const api = createClient<paths>({ baseUrl: "" })
api.use(auth)
