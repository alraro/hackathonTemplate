import { useEffect, useRef } from "react"
import { createRoot, type Root } from "react-dom/client"
import { LngLatBounds, Map as MapLibreMap, NavigationControl, Popup, type GeoJSONSource, type MapLayerMouseEvent } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { formatHex, parse } from "culori"
import { LocateFixed } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Point = { type: "Point"; coordinates: number[] }
type FeatureCollection = { type: "FeatureCollection"; features: { type: "Feature"; properties: { index: number }; geometry: Point }[] }

export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty"

export type MapViewProps<T> = {
  items: T[]
  /** Return the position of an item, or null to skip it. */
  getLatLng: (item: T) => { lat: number; lng: number } | null | undefined
  onSelect?: (item: T) => void
  /** [lng, lat] of the initial view; defaults to the bounds of the items. */
  center?: [number, number]
  zoom?: number
}

/** Resolve a CSS token (e.g. `--primary`) to a hex string MapLibre can paint with. */
function token(name: string, fallback: string) {
  try {
    const el = document.createElement("span")
    el.style.color = `var(${name})`
    document.body.appendChild(el)
    const color = getComputedStyle(el).color
    el.remove()
    return formatHex(parse(color)) ?? fallback
  } catch {
    return fallback
  }
}

function popupText(item: unknown) {
  const r = item as Record<string, unknown>
  const pick = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "")
  return { title: pick("title") || pick("name") || "Selected", detail: pick("category") || pick("description") }
}

function fit(m: MapLibreMap, data: FeatureCollection, hasCenter: boolean) {
  if (hasCenter || data.features.length === 0) return
  const b = new LngLatBounds()
  for (const f of data.features) b.extend((f.geometry as Point).coordinates as [number, number])
  m.fitBounds(b, { padding: 60, maxZoom: 14, duration: 0 })
}

/** Interactive map: clustered markers, popup card on click, "my location" button. */
export function MapView<T>({ items, getLatLng, onSelect, center, zoom = 11 }: MapViewProps<T>) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const latest = useRef({ items, getLatLng, onSelect })
  latest.current = { items, getLatLng, onSelect }

  const toGeoJSON = (): FeatureCollection => ({
    type: "FeatureCollection",
    features: latest.current.items.flatMap((item, index) => {
      const p = latest.current.getLatLng(item)
      return p ? [{ type: "Feature" as const, properties: { index }, geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] } }] : []
    }),
  })

  // Create the map once.
  useEffect(() => {
    if (!box.current) return
    const primary = token("--primary", "#4f46e5")
    const fg = token("--primary-foreground", "#ffffff")
    const m = new MapLibreMap({ container: box.current, style: MAP_STYLE_URL, center: center ?? [0, 20], zoom: center ? zoom : 1 })
    map.current = m
    m.addControl(new NavigationControl({ showCompass: false }), "top-right")
    let popupRoot: Root | null = null

    m.on("load", () => {
      const data = toGeoJSON()
      m.addSource("items", { type: "geojson", data, cluster: true, clusterRadius: 50, clusterMaxZoom: 14 })
      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "items",
        filter: ["has", "point_count"],
        paint: { "circle-color": primary, "circle-opacity": 0.85, "circle-radius": ["step", ["get", "point_count"], 16, 5, 22, 15, 28] },
      })
      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "items",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 13, "text-font": ["Noto Sans Bold"] },
        paint: { "text-color": fg },
      })
      m.addLayer({
        id: "points",
        type: "circle",
        source: "items",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": primary, "circle-radius": 8, "circle-stroke-width": 2, "circle-stroke-color": fg },
      })
      fit(m, data, !!center)
    })

    m.on("click", "clusters", async (e: MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const src = m.getSource("items") as GeoJSONSource
      const z = await src.getClusterExpansionZoom(f.properties.cluster_id as number)
      m.easeTo({ center: (f.geometry as Point).coordinates as [number, number], zoom: z })
    })

    m.on("click", "points", (e: MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      const item = latest.current.items[f.properties.index as number]
      if (item === undefined) return
      latest.current.onSelect?.(item)
      const node = document.createElement("div")
      popupRoot?.unmount()
      popupRoot = createRoot(node)
      const { title, detail } = popupText(item)
      popupRoot.render(
        <Card className="border-0 py-2 shadow-none">
          <CardContent className="space-y-0.5 px-3">
            <p className="font-medium">{title}</p>
            {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
          </CardContent>
        </Card>,
      )
      new Popup({ offset: 12 }).setLngLat((f.geometry as Point).coordinates as [number, number]).setDOMContent(node).addTo(m)
    })

    for (const layer of ["clusters", "points"]) {
      m.on("mouseenter", layer, () => (m.getCanvas().style.cursor = "pointer"))
      m.on("mouseleave", layer, () => (m.getCanvas().style.cursor = ""))
    }

    return () => {
      popupRoot?.unmount()
      m.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push new items into the source.
  useEffect(() => {
    const m = map.current
    const src = m?.getSource("items") as GeoJSONSource | undefined
    if (m && src) {
      const data = toGeoJSON()
      src.setData(data)
      fit(m, data, !!center)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  function locate() {
    if (!navigator.geolocation) return void toast.error("Geolocation is not available in this browser")
    navigator.geolocation.getCurrentPosition(
      (pos) => map.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 }),
      () => toast.error("Location permission denied. Allow it in the browser to centre the map on you."),
    )
  }

  return (
    <div className="relative h-[28rem] w-full overflow-hidden rounded-lg border">
      <div ref={box} className="absolute inset-0" />
      <Button type="button" size="sm" variant="secondary" className="absolute left-2 top-2" onClick={locate}>
        <LocateFixed /> My location
      </Button>
    </div>
  )
}

export default MapView
