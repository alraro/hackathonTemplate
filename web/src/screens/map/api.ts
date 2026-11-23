import { useQuery } from "@tanstack/react-query"
import { api, API_MODE } from "@/lib/api/client"
import fixtureRows from "./fixtures.json"

export type Place = { id?: number; title: string; category?: string; description?: string; lat: number; lng: number }

const hasLatLng = (r: unknown): r is Place => {
  const o = r as Record<string, unknown>
  return typeof o?.lat === "number" && typeof o?.lng === "number"
}

// Live mode plots the rows of this resource that carry numeric lat/lng. Change it to your domain
// resource (the items seed carries lat/lng around Málaga, so markers show out of the box).
const RESOURCE = "items"

export function usePlaces() {
  return useQuery({
    queryKey: ["map", "places", API_MODE],
    queryFn: async (): Promise<Place[]> => {
      if (API_MODE === "fixtures") return fixtureRows as Place[]
      // RESOURCE is a plain string, so the typed client needs a cast; the auth header still applies.
      const { data, error } = await api.GET(`/api/${RESOURCE}` as "/api/items", { params: { query: { limit: 200 } } })
      if (error || !data) throw new Error("Could not load places")
      const body = data as unknown
      return ((Array.isArray(body) ? body : (body as { items: unknown[] }).items) as unknown[]).filter(hasLatLng)
    },
  })
}
