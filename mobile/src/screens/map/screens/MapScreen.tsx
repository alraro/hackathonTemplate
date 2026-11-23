import { useQuery } from "@tanstack/react-query"
import { Alert, View } from "react-native"
import { QueryState } from "../../../components/common/QueryState"
import { MapView } from "../../../components/common/MapView"
import { useTheme } from "../../../components/ui/useTheme"
import { API_MODE, api } from "../../../lib/api/client"
import fixtures from "../fixtures.json"

type Place = { id?: string | number; name?: string; title?: string; description?: string; lat: number; lng: number }

const label = (p: Place) => p.name ?? p.title ?? `#${p.id ?? ""}`

async function loadPlaces(): Promise<Place[]> {
  if (API_MODE === "fixtures") return fixtures
  const { data, error } = await api.GET("/api/items")
  if (error || !data) throw new Error("Could not load places")
  // ItemRead carries optional lat/lng; only items with both become markers.
  return data.items.flatMap((i) =>
    typeof i.lat === "number" && typeof i.lng === "number"
      ? [{ id: i.id, title: i.title, description: i.description, lat: i.lat, lng: i.lng }]
      : [],
  )
}

export default function MapScreen() {
  const { colors } = useTheme()
  const query = useQuery({ queryKey: ["items", "map"], queryFn: loadPlaces })

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryState query={query} emptyTitle="No places with a location">
        {(places) => (
          <MapView
            items={places}
            getLatLng={(p) => ({ lat: p.lat, lng: p.lng })}
            getTitle={label}
            getDescription={(p) => p.description}
            onSelect={(p) => Alert.alert(label(p), p.description)}
          />
        )}
      </QueryState>
    </View>
  )
}
