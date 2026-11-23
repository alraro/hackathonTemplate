import type { ComponentType } from "react"
import { createBrowserRouter, type RouteObject } from "react-router"
import { Home, LayoutDashboard, List, MapPin, Palette, Settings, type LucideIcon } from "lucide-react"
import { MessageSquare } from "lucide-react" // module:llm
import features from "@features"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"
import { RequireAuth } from "@/lib/session"
import { AppLayout } from "./layouts/AppLayout"
import { MarketingLayout } from "./layouts/MarketingLayout"

type FeatureId = keyof typeof features

export type ScreenRoute = {
  id: string
  path: string
  /** Feature that owns this screen; the route is dropped when it is off in features.json. Core screens omit it. */
  featureId?: FeatureId
  layout: "marketing" | "app"
  nav?: { label: string; icon: LucideIcon }
  lazy: () => Promise<{ default: ComponentType }>
}

// module:web
// One entry per screen. Later issues fill the pages under web/src/screens/<id>/pages/; they never edit this list.
export const screenRoutes: ScreenRoute[] = [
  { id: "home", path: "/", layout: "app", nav: { label: "Home", icon: Home }, lazy: () => import("@/screens/home/pages/HomePage") },
  { id: "landing", path: "/welcome", featureId: "landing", layout: "marketing", lazy: () => import("@/screens/landing/pages/LandingPage") },
  { id: "login", path: "/login", featureId: "auth", layout: "marketing", lazy: () => import("@/screens/auth/pages/LoginPage") },
  { id: "signup", path: "/signup", featureId: "auth", layout: "marketing", lazy: () => import("@/screens/auth/pages/SignupPage") },
  { id: "dashboard", path: "/dashboard", featureId: "dashboard", layout: "app", nav: { label: "Dashboard", icon: LayoutDashboard }, lazy: () => import("@/screens/dashboard/pages/DashboardPage") },
  { id: "crud-list", path: "/items", featureId: "crud", layout: "app", nav: { label: "Items", icon: List }, lazy: () => import("@/screens/crud/pages/ListPage") },
  { id: "crud-new", path: "/items/new", featureId: "crud", layout: "app", lazy: () => import("@/screens/crud/pages/FormPage") },
  { id: "crud-detail", path: "/items/:id", featureId: "crud", layout: "app", lazy: () => import("@/screens/crud/pages/DetailPage") },
  { id: "crud-edit", path: "/items/:id/edit", featureId: "crud", layout: "app", lazy: () => import("@/screens/crud/pages/FormPage") },
  { id: "chat", path: "/chat", featureId: "chat", layout: "app", nav: { label: "Chat", icon: MessageSquare }, lazy: () => import("@/screens/chat/pages/ChatPage") }, // module:llm
  { id: "map", path: "/map", featureId: "map", layout: "app", nav: { label: "Map", icon: MapPin }, lazy: () => import("@/screens/map/pages/MapPage") },
  { id: "settings", path: "/settings", featureId: "settings", layout: "app", nav: { label: "Settings", icon: Settings }, lazy: () => import("@/screens/settings/pages/SettingsPage") },
  { id: "showcase", path: "/showcase", featureId: "showcase", layout: "app", nav: { label: "Showcase", icon: Palette }, lazy: () => import("@/screens/showcase/pages/ShowcasePage") },
  // Keep last: catch-all.
  { id: "not-found", path: "*", layout: "app", lazy: () => import("@/screens/not-found/pages/NotFoundPage") },
]

const enabled = screenRoutes.filter((r) => !r.featureId || features[r.featureId])

/** Sidebar / bottom bar entries, derived from the registry. */
export const navItems = enabled
  .filter((r) => r.nav)
  .map((r) => ({ id: r.id, to: r.path, label: r.nav!.label, icon: r.nav!.icon }))

const toRoute = (r: ScreenRoute): RouteObject => ({
  id: r.id,
  path: r.path,
  ErrorBoundary,
  lazy: async () => ({ Component: (await r.lazy()).default }),
})

export const routes: RouteObject[] = [
  { Component: MarketingLayout, ErrorBoundary, children: enabled.filter((r) => r.layout === "marketing").map(toRoute) },
  {
    Component: AppLayout,
    ErrorBoundary,
    // Signed-out users are sent to /login (pass-through when the auth Feature is off).
    children: [{ Component: RequireAuth, ErrorBoundary, children: enabled.filter((r) => r.layout === "app").map(toRoute) }],
  },
]

export const router = createBrowserRouter(routes)
