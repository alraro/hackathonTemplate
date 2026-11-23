import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Platform } from "react-native"
import { useRouter, useSegments } from "expo-router"
import features from "../../../features.json"
import { setToken } from "./api/client"
import type { components } from "./api/schema"

export type SessionUser = components["schemas"]["UserPublic"]

type Stored = { token: string; user: SessionUser }

export type Session = {
  user: SessionUser | null
  token: string | null
  /** False until the stored session has been read. */
  ready: boolean
  signIn: (token: string, user: SessionUser) => Promise<void>
  /** Replace the user in the session (e.g. after a profile edit). */
  setUser: (user: SessionUser) => Promise<void>
  signOut: () => Promise<void>
}

/** Off in `features.json`: no login screen, no redirect. */
export const AUTH_ENABLED = (features as Record<string, boolean>).auth !== false

const KEY = "session"

// SecureStore on device; localStorage on web preview (SecureStore is unavailable there).
const store = {
  async get(): Promise<string | null> {
    try {
      if (Platform.OS === "web") return globalThis.localStorage?.getItem(KEY) ?? null
      return await (await import("expo-secure-store")).getItemAsync(KEY)
    } catch {
      return null
    }
  },
  async set(value: string | null) {
    try {
      if (Platform.OS === "web") {
        if (value === null) globalThis.localStorage?.removeItem(KEY)
        else globalThis.localStorage?.setItem(KEY, value)
        return
      }
      const SecureStore = await import("expo-secure-store")
      if (value === null) await SecureStore.deleteItemAsync(KEY)
      else await SecureStore.setItemAsync(KEY, value)
    } catch {
      // Storage unavailable: the session just lives in memory.
    }
  },
}

const Ctx = createContext<Session | null>(null)

export function useSession(): Session {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>")
  return ctx
}

/** Holds the session and redirects to `(auth)/login` when auth is on and nobody is signed in. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored | null>(null)
  const [ready, setReady] = useState(false)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    store.get().then((raw) => {
      if (raw) {
        try {
          const s = JSON.parse(raw) as Stored
          setToken(s.token)
          setState(s)
        } catch {
          // Corrupt entry: ignore.
        }
      }
      setReady(true)
    })
  }, [])

  const persist = useCallback(async (next: Stored | null) => {
    setToken(next?.token ?? null)
    setState(next)
    await store.set(next ? JSON.stringify(next) : null)
  }, [])

  const value = useMemo<Session>(
    () => ({
      user: state?.user ?? null,
      token: state?.token ?? null,
      ready,
      signIn: (token, user) => persist({ token, user }),
      setUser: (user) => persist(state ? { token: state.token, user } : null),
      signOut: () => persist(null),
    }),
    [state, ready, persist],
  )

  const inAuth = (segments[0] as string | undefined) === "(auth)"
  useEffect(() => {
    if (!AUTH_ENABLED || !ready) return
    if (!state && !inAuth) router.replace("/(auth)/login" as never)
    else if (state && inAuth) router.replace("/" as never)
  }, [state, ready, inAuth, router])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
