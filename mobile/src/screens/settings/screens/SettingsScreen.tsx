import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Constants from "expo-constants"
import { Button, Input, Screen, Text } from "../../../components/ui"
import { QueryState } from "../../../components/common/QueryState"
import { API_MODE, api } from "../../../lib/api/client"
import { AUTH_ENABLED, useSession, type SessionUser } from "../../../lib/session"

function ProfileForm({ user }: { user: SessionUser }) {
  const { setUser } = useSession()
  const [name, setName] = useState(user.name)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    setError(undefined)
    const previous = user
    await setUser({ ...user, name }) // optimistic
    try {
      if (API_MODE === "live") {
        const { data, error: err } = await api.PATCH("/api/auth/me", { body: { name } })
        if (err || !data) throw new Error("save failed")
        await setUser(data)
      }
    } catch {
      await setUser(previous)
      setName(previous.name)
      setError("Could not save your name.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Input label="Name" value={name} onChangeText={setName} error={error} />
      <Button label="Save" loading={saving} disabled={!name.trim() || name === user.name} onPress={save} />
    </>
  )
}

export default function SettingsScreen() {
  const { user, signOut } = useSession()
  // The session is in memory; the query gives loading/error states the uniform QueryState shape.
  const query = useQuery({ queryKey: ["session-user", user?.id ?? null], queryFn: async () => user, initialData: user ?? undefined })
  return (
    <Screen scroll>
      <Text variant="title">Settings</Text>
      {AUTH_ENABLED ? (
        <QueryState query={{ ...query, data: user ?? undefined }}>{(u) => <ProfileForm key={u.id} user={u} />}</QueryState>
      ) : null}
      <Text muted>Version {Constants.expoConfig?.version ?? "dev"}</Text>
      {AUTH_ENABLED ? <Button label="Sign out" variant="destructive" onPress={() => signOut()} /> : null}
    </Screen>
  )
}
