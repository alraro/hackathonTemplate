import * as Location from "expo-location"
import { useEffect, useState } from "react"
import RNMapView, { Callout, Marker } from "react-native-maps"

export type MapViewProps<T> = {
  items: T[]
  getLatLng: (item: T) => { lat: number; lng: number } | null | undefined
  onSelect?: (item: T) => void
  /** Marker title / callout text. */
  getTitle?: (item: T) => string
  getDescription?: (item: T) => string | undefined
}

/** react-native-maps view: one marker + callout per item, user location after a permission prompt. No clustering. */
export function MapView<T>({ items, getLatLng, onSelect, getTitle, getDescription }: MapViewProps<T>) {
  const [located, setLocated] = useState(false)
  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then((r) => setLocated(r.status === "granted"))
      .catch(() => setLocated(false))
  }, [])

  const points = items.flatMap((item, i) => {
    const p = getLatLng(item)
    return p ? [{ item, i, p }] : []
  })
  const first = points[0]?.p

  return (
    <RNMapView
      style={{ flex: 1 }}
      showsUserLocation={located}
      initialRegion={{
        latitude: first?.lat ?? 0,
        longitude: first?.lng ?? 0,
        latitudeDelta: first ? 0.2 : 60,
        longitudeDelta: first ? 0.2 : 60,
      }}
    >
      {points.map(({ item, i, p }) => (
        <Marker
          key={i}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          title={getTitle?.(item)}
          description={getDescription?.(item)}
        >
          {onSelect && <Callout onPress={() => onSelect(item)} />}
        </Marker>
      ))}
    </RNMapView>
  )
}
