import { lazy, Suspense, type ReactNode } from "react"
import type { MapViewProps } from "@/components/common/MapView"
import { PageHeader } from "@/components/common/PageHeader"
import { QueryState } from "@/components/common/QueryState"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlaces } from "../api"

// maplibre-gl is heavy: load it only when this screen opens.
const MapView = lazy(() => import("@/components/common/MapView")) as <T>(props: MapViewProps<T>) => ReactNode

export default function MapPage() {
  const query = usePlaces()
  return (
    <>
      <PageHeader title="Map" description="Places with a location, clustered. Click a marker for details." />
      <QueryState query={query} empty={{ title: "No places with a location", description: "Rows need numeric lat and lng fields to appear here." }}>
        {(places) => (
          <Suspense fallback={<Skeleton className="h-[28rem] w-full" />}>
            <MapView items={places} getLatLng={(p) => ({ lat: p.lat, lng: p.lng })} />
          </Suspense>
        )}
      </QueryState>
    </>
  )
}
