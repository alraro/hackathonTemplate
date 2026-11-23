import { Link, useLocation, useNavigate } from "react-router"
import { z } from "zod"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/lib/session"
import { AuthForm } from "../AuthForm"
import fixtures from "../fixtures.json"

const schema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
})

const demoUsers = fixtures as { email: string; name: string; role: string }[]

export default function LoginPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/"
  const go = () => navigate(from, { replace: true })

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <PageHeader title="Log in" />
      <AuthForm
        schema={schema}
        defaults={{ email: "", password: "" }}
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        submitLabel="Log in"
        onSubmit={async ({ email, password }) => {
          await signIn(email, password)
          go()
        }}
        footer={
          <p className="text-center text-sm text-muted-foreground">
            No account? <Link to="/signup" className="underline underline-offset-4">Sign up</Link>
          </p>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Demo users</CardTitle>
          <CardDescription>One click, no password.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {demoUsers.map((u) => (
            <Button
              key={u.email}
              variant="outline"
              onClick={async () => {
                await signIn(u.email, "demo")
                go()
              }}
            >
              Log in as {u.name} ({u.role})
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
