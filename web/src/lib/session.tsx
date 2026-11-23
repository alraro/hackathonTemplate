import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Navigate, Outlet, useLocation } from "react-router"
import features from "@features"
import { api, getToken, setToken } from "@/lib/api/client"
import type { components } from "@/lib/api/schema"

export type SessionUser = components["schemas"]["UserPublic"]
type UserUpdate = components["schemas"]["UserUpdate"]

export type Session = {
  user: SessionUser | null
  token: string | null
  /** True while a stored token is being checked against /api/auth/me. */
  loading: boolean
  /** Throws Error(message) on bad credentials so forms can show it inline. */
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>
  signOut: () => void
  update: (changes: UserUpdate) => Promise<void>
}

const USER_KEY = "session_user"

function readUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}
function writeUser(user: SessionUser | null) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* storage unavailable */
  }
}

function errorMessage(error: unknown, fallback: string): string {
  const detail = (error as { detail?: unknown } | undefined)?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === "string") return detail[0].msg
  return fallback
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken)
  const [user, setUser] = useState<SessionUser | null>(() => (getToken() ? readUser() : null))
  const [loading, setLoading] = useState<boolean>(() => !!getToken())

  const store = useCallback((t: string | null, u: SessionUser | null) => {
    setToken(t)
    writeUser(u)
    setTokenState(t)
    setUser(u)
  }, [])

  // Validate a stored token once on load.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .GET("/api/auth/me")
      .then(({ data, response }) => {
        if (cancelled) return
        if (data) store(getToken(), data)
        else if (response.status === 401) store(null, null) // only an auth failure ends the session; 5xx keeps it
      })
      .catch(() => {
        /* offline: keep the stored session */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [store])

  const signIn = useCallback<Session["signIn"]>(
    async (email, password) => {
      const { data, error } = await api.POST("/api/auth/login", { body: { email, password } })
      if (!data) throw new Error(errorMessage(error, "Invalid email or password"))
      store(data.access_token, data.user)
    },
    [store],
  )

  const signUp = useCallback<Session["signUp"]>(
    async (body) => {
      const { data, error } = await api.POST("/api/auth/signup", { body })
      if (!data) throw new Error(errorMessage(error, "Could not create the account"))
      store(data.access_token, data.user)
    },
    [store],
  )

  const signOut = useCallback(() => store(null, null), [store])

  const update = useCallback<Session["update"]>(
    async (changes) => {
      const { data, error } = await api.PATCH("/api/auth/me", { body: changes })
      if (!data) throw new Error(errorMessage(error, "Could not update the profile"))
      store(getToken(), data)
    },
    [store],
  )

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut, update }),
    [user, token, loading, signIn, signUp, signOut, update],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): Session {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider> (see app/providers.tsx)")
  return ctx
}

/** Layout route: redirects to /login (remembering the requested route) when signed out. Pass-through with `auth` off. */
export function RequireAuth({ children }: { children?: ReactNode }) {
  const { user, loading } = useSession()
  const location = useLocation()
  if (!features.auth) return <>{children ?? <Outlet />}</>
  if (loading) return <div role="status" aria-label="Loading" className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <>{children ?? <Outlet />}</>
}
