import { useQuery } from "@tanstack/react-query"
import { Alert, View } from "react-native"
import { NotificationBell } from "../../../components/common/NotificationBell"
import { QueryState } from "../../../components/common/QueryState"
import { MapView } from "../../../components/common/MapView"
import { Text } from "../../../components/ui/Text"
import { useTheme } from "../../../components/ui/useTheme"
import { API_MODE, api } from "../../../lib/api/client"
import fixtures from "../fixtures.json"

type Place = { id?: string | number; name?: string; title?: string; description?: string; lat: number; lng: number }

const label = (p: Place) => p.name ?? p.title ?? `#${p.id ?? ""}`

async function loadPlaces(): Promise<Place[]> {
  if (API_MODE === "fixtures") return fixtures
  const { data, error } = await api.GET("/api/items")
  if (error) throw new Error("Could not load places")
  const rows = ((data as { items?: unknown[] } | undefined)?.items ?? []) as Partial<Place>[]
  return rows.filter((r): r is Place => typeof r.lat === "number" && typeof r.lng === "number")
}

export default function MapScreen() {
  const { colors } = useTheme()
  const query = useQuery({ queryKey: ["items", "map"], queryFn: loadPlaces })

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 48 }}>
        <Text variant="title">Map</Text>
        <NotificationBell />
      </View>
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
