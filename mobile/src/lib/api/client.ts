import createClient, { type Middleware } from "openapi-fetch"
import type { paths } from "./schema"
import { fixturesFetch } from "./fixturesFetch"

/** `fixtures` (default): answers from `screens/<x>/fixtures.json`. `live`: requests reach the backend. */
export const API_MODE: "fixtures" | "live" = process.env.EXPO_PUBLIC_API_MODE === "live" ? "live" : "fixtures"

/** Set inline by `make mobile` to the host LAN IP; falls back to the emulator-to-host alias. */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8000"

// Session token lives in memory; the auth Feature can persist it (e.g. expo-secure-store) via setToken.
let token: string | null = null
export const getToken = () => token
export const setToken = (value: string | null) => {
  token = value
}

const auth: Middleware = {
  onRequest({ request }) {
    if (token) request.headers.set("Authorization", `Bearer ${token}`)
    return request
  },
}

/** Typed client; paths are `/api/...` in both modes. */
export const api = createClient<paths>({
  baseUrl: API_MODE === "live" ? API_URL : "http://fixtures.local",
  ...(API_MODE === "fixtures" ? { fetch: fixturesFetch } : {}),
})
api.use(auth)
