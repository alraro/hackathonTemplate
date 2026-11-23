import { useState } from "react"
import { View } from "react-native"
import { Button, Input, Screen, Text } from "../../../components/ui"
import { API_MODE, api } from "../../../lib/api/client"
import { useSession, type SessionUser } from "../../../lib/session"
import demoUsers from "../fixtures.json"

type Demo = { email: string; name: string; role: string; preferences?: Record<string, unknown> }
const DEMO = demoUsers as Demo[]
const DEMO_PASSWORD = "demo"

const toUser = (d: Demo, id: number): SessionUser =>
  ({ id, email: d.email, name: d.name, role: d.role, preferences: d.preferences ?? {} }) as SessionUser

export default function LoginScreen() {
  const { signIn } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  async function login(e: string, p: string) {
    setBusy(true)
    setError(undefined)
    try {
      if (API_MODE === "fixtures") {
        // Fixtures mode: any credentials work; a known demo email picks that user, else the first.
        const i = Math.max(0, DEMO.findIndex((d) => d.email === e))
        await signIn("fixtures-token", toUser(DEMO[i], i + 1))
        return
      }
      const { data, error: err } = await api.POST("/api/auth/login", { body: { email: e, password: p } })
      if (err || !data) {
        setError("Could not sign in. Check your email and password.")
        return
      }
      await signIn(data.access_token, data.user)
    } catch {
      setError("Could not reach the server.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen scroll>
      <Text variant="title">Sign in</Text>
      <Text muted>Pick a demo user or enter your credentials.</Text>
      {DEMO.map((d) => (
        <Button
          key={d.email}
          label={`Continue as ${d.name} (${d.role})`}
          variant="secondary"
          disabled={busy}
          onPress={() => login(d.email, DEMO_PASSWORD)}
        />
      ))}
      <View style={{ gap: 12, marginTop: 8 }}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" error={error} />
        <Button label="Sign in" loading={busy} onPress={() => login(email, password)} />
      </View>
    </Screen>
  )
}
