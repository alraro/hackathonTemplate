import { Link, NavLink, Outlet } from "react-router"
import features from "@features"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "./AppLayout"

export function MarketingLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="truncate font-semibold">{APP_NAME}</Link>
          <nav className="flex items-center gap-2">
            {features.landing ? (
              <NavLink to="/welcome" className="px-2 text-sm text-muted-foreground hover:text-foreground">About</NavLink>
            ) : null}
            {features.auth ? (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
                <Button asChild size="sm"><Link to="/signup">Sign up</Link></Button>
              </>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">{APP_NAME}</footer>
    </div>
  )
}
