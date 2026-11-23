import { useQuery } from "@tanstack/react-query"
import { API_MODE } from "@/lib/api/client"
import fixtureRows from "./fixtures.json"

export type Place = { id?: number; title: string; category?: string; description?: string; lat: number; lng: number }

const hasLatLng = (r: unknown): r is Place => {
  const o = r as Record<string, unknown>
  return typeof o?.lat === "number" && typeof o?.lng === "number"
}

// Live mode plots the rows of this resource that carry numeric lat/lng. Change it to your domain
// resource (the items seed has no coordinates, so the screen shows its empty state until then).
const RESOURCE = "items"

export function usePlaces() {
  return useQuery({
    queryKey: ["map", "places", API_MODE],
    queryFn: async (): Promise<Place[]> => {
      if (API_MODE === "fixtures") return fixtureRows as Place[]
      const res = await fetch(`/api/${RESOURCE}?limit=200`)
      if (!res.ok) throw new Error("Could not load places")
      const body = await res.json()
      return ((Array.isArray(body) ? body : body.items) as unknown[]).filter(hasLatLng)
    },
  })
}
