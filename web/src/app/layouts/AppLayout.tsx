import { Link, NavLink, Outlet } from "react-router"
import { cn } from "@/lib/utils"
import { navItems } from "../routes"

/** Identity name; the design Identity (#69) can replace this constant. */
export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? "Hackathon App"

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r p-3 md:flex">
        <Link to="/" className="mb-3 px-2 font-semibold">{APP_NAME}</Link>
        {navItems.map(({ id, to, label, icon: Icon }) => (
          <NavLink
            key={id}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent font-medium text-accent-foreground",
              )
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-4">
          <Link to="/" className="truncate font-semibold md:hidden">{APP_NAME}</Link>
        </header>
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t bg-background md:hidden" aria-label="Primary">
        {navItems.map(({ id, to, label, icon: Icon }) => (
          <NavLink
            key={id}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex min-w-16 flex-1 flex-col items-center gap-1 px-2 py-2 text-xs text-muted-foreground",
                isActive && "text-foreground",
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
