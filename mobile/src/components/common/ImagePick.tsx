import { useState } from "react"
import { ActivityIndicator, Image, Linking, View } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { API_MODE, API_URL, getToken } from "../../lib/api/client"
import type { components } from "../../lib/api/schema"
import { Button } from "../ui/Button"
import { Text } from "../ui/Text"

export type FileRecord = components["schemas"]["FileRead"]
export type PickedFile = { uri: string; name: string; mime: string; size?: number }

export type ImagePickProps = {
  /** Called with the local file right after picking (and before upload). */
  onPicked?: (file: PickedFile) => void
  /** Called with the created file record when `upload` is true. */
  onUploaded?: (record: FileRecord) => void
  source?: "camera" | "library" | "both"
  /** Post the picked image to `/api/files`. Fixtures mode returns a fake record with the local URI. */
  upload?: boolean
}

/** POST multipart to /api/files. RN fetch has no upload progress, so callers show a spinner. */
export async function uploadFile(file: PickedFile): Promise<FileRecord> {
  if (API_MODE === "fixtures") {
    return {
      id: Date.now(),
      name: file.name,
      mime: file.mime,
      size: file.size ?? 0,
      url: file.uri,
      owner_id: null,
      created_at: new Date().toISOString(),
    }
  }
  const form = new FormData()
  // React Native's FormData accepts { uri, name, type } as a file part.
  form.append("file", { uri: file.uri, name: file.name, type: file.mime } as unknown as Blob)
  const token = getToken()
  const res = await fetch(`${API_URL}/api/files`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  return (await res.json()) as FileRecord
}

export function ImagePick({ onPicked, onUploaded, source = "both", upload }: ImagePickProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pick(from: "camera" | "library") {
    setError(null)
    const perm =
      from === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      setDenied(true)
      return
    }
    setDenied(false)
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.8 }
    const result =
      from === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts)
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    const file: PickedFile = {
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "photo.jpg",
      mime: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize,
    }
    setPreview(file.uri)
    onPicked?.(file)
    if (upload) {
      setBusy(true)
      try {
        onUploaded?.(await uploadFile(file))
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed")
      } finally {
        setBusy(false)
      }
    }
  }

  return (
    <View style={{ gap: 12 }}>
      {preview ? (
        <Image
          source={{ uri: preview }}
          accessibilityLabel="Selected image preview"
          style={{ width: 160, height: 160, borderRadius: 12 }}
        />
      ) : null}
      {busy ? <ActivityIndicator accessibilityLabel="Uploading" /> : null}
      {error ? <Text muted>{error}</Text> : null}
      {denied ? (
        <View style={{ gap: 8 }}>
          <Text muted>Permission denied. Allow camera or photo access in Settings to continue.</Text>
          <Button label="Open settings" variant="secondary" onPress={() => Linking.openSettings()} />
        </View>
      ) : null}
      <View style={{ gap: 8 }}>
        {source !== "library" ? <Button label="Take photo" disabled={busy} onPress={() => pick("camera")} /> : null}
        {source !== "camera" ? (
          <Button label="Choose from library" variant="secondary" disabled={busy} onPress={() => pick("library")} />
        ) : null}
      </View>
    </View>
  )
}
