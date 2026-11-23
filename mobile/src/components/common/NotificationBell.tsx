import { Bell } from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import { FlatList, Modal, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useChannel } from "../../lib/realtime/useChannel"
import { Text } from "../ui/Text"
import { MIN_TARGET, useTheme } from "../ui/useTheme"

type Note = { id: number; title: string; body: string; read: boolean }

/** Header-right bell: unread count from `notifications:<userId>`, modal list, small in-app banner for new ones. */
export function NotificationBell({ userId = "me" }: { userId?: string | number }) {
  const { colors, radius } = useTheme()
  const insets = useSafeAreaInsets()
  const [notes, setNotes] = useState<Note[]>([])
  const [open, setOpen] = useState(false)
  const [banner, setBanner] = useState<Note | null>(null)
  const nextId = useRef(1)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useChannel(`notifications:${userId}`, {
    onMessage: (data) => {
      const d = (data ?? {}) as { title?: string; body?: string }
      const note: Note = { id: nextId.current++, title: d.title ?? "Notification", body: d.body ?? "", read: false }
      setNotes((n) => [note, ...n])
      setBanner(note)
      clearTimeout(bannerTimer.current)
      bannerTimer.current = setTimeout(() => setBanner(null), 4000)
    },
  })
  useEffect(() => () => clearTimeout(bannerTimer.current), [])

  const unread = notes.filter((n) => !n.read).length
  const show = () => {
    setOpen(true)
    setBanner(null)
    setNotes((n) => n.map((x) => ({ ...x, read: true })))
  }

  return (
    <View>
      <Pressable
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel={`Notifications, ${unread} unread`}
        style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
      >
        <Bell color={colors.foreground} size={24} />
        {unread > 0 && (
          <View
            style={{
              position: "absolute",
              top: 4,
              right: 2,
              minWidth: 18,
              height: 18,
              borderRadius: radius,
              paddingHorizontal: 4,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="caption" style={{ color: colors["primary-foreground"] }}>{unread > 99 ? "99+" : unread}</Text>
          </View>
        )}
      </Pressable>

      {banner && !open && (
        <Pressable
          onPress={show}
          accessibilityLiveRegion="polite"
          style={{
            position: "absolute",
            top: MIN_TARGET, // just below the bell
            right: 0,
            width: 240,
            padding: 10,
            borderRadius: radius,
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            zIndex: 10,
            elevation: 4,
          }}
        >
          <Text variant="title">{banner.title}</Text>
          <Text muted numberOfLines={2}>
            {banner.body}
          </Text>
        </Pressable>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, paddingTop: insets.top + 16, gap: 12 }}>
          <Text variant="title">Notifications</Text>
          <FlatList
            data={notes}
            keyExtractor={(n) => String(n.id)}
            ListEmptyComponent={<Text muted>No notifications yet.</Text>}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 12,
                  borderRadius: radius,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text variant="title">{item.title}</Text>
                <Text muted>{item.body}</Text>
              </View>
            )}
          />
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}
          >
            <Text>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  )
}
