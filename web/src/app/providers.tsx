import { createContext, useContext, useState, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

/** Slot for the auth Feature (#77): it supplies the real session. */
export type Session = { user: { id: string; name: string } | null }
const SessionContext = createContext<Session>({ user: null })
export const SessionProvider = SessionContext.Provider
export const useSessionContext = () => useContext(SessionContext)

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }))
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={client}>
        <SessionProvider value={{ user: null }}>
          {children}
          <Toaster />
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
