import { useRef, useState } from "react"
import { Linking, Vibration, View } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Button } from "../ui/Button"
import { Text } from "../ui/Text"
import { useTheme } from "../ui/useTheme"

export type QrScannerProps = {
  onScan: (text: string) => void
  /** Stop after the first result. */
  once?: boolean
}

export function QrScanner({ onScan, once }: QrScannerProps) {
  const { radius } = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const [done, setDone] = useState(false)
  const last = useRef<string | null>(null)

  if (!permission) return null
  if (!permission.granted) {
    return (
      <View style={{ gap: 8, padding: 16 }}>
        <Text muted>Camera access is needed to scan QR codes.</Text>
        {permission.canAskAgain ? (
          <Button label="Allow camera" onPress={requestPermission} />
        ) : (
          <Button label="Open settings" variant="secondary" onPress={() => Linking.openSettings()} />
        )}
      </View>
    )
  }

  function handle({ data }: { data: string }) {
    if (done || data === last.current) return
    last.current = data
    // Haptic feedback via the built-in Vibration API (expo-haptics is not a template dependency).
    Vibration.vibrate(30)
    if (once) setDone(true)
    onScan(data)
  }

  return (
    <View style={{ aspectRatio: 1, width: "100%", borderRadius: radius, overflow: "hidden" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={done ? undefined : handle}
      />
      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" }}>
        {/* Explicit white: the camera feed is always dark, whatever the colour scheme. */}
        <View style={{ width: "65%", aspectRatio: 1, borderWidth: 3, borderColor: "#ffffff", borderRadius: radius }} />
      </View>
      {done ? (
        <View style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
          <Button
            label="Scan again"
            variant="secondary"
            onPress={() => {
              last.current = null
              setDone(false)
            }}
          />
        </View>
      ) : null}
    </View>
  )
}
