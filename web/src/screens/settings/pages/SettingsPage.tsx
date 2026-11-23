import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/session"

const schema = z.object({ name: z.string().trim().min(1, "Enter your name").max(100) })
type Values = z.infer<typeof schema>

const MODE_KEY = "theme_mode"
type Mode = "light" | "dark"

function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

function ProfileCard() {
  const { user, update } = useSession()
  const form = useForm<Values>({ resolver: zodResolver(schema), values: { name: user?.name ?? "" } })
  const submit = form.handleSubmit(async ({ name }) => {
    try {
      await update({ name })
      toast.success("Profile saved")
    } catch (e) {
      form.setError("root", { message: e instanceof Error ? e.message : "Could not save" })
    }
  })
  const rootError = form.formState.errors.root?.message
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>{user?.email ?? "Sign in to edit your profile."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" disabled={!user} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {rootError && <p role="alert" className="text-sm text-destructive">{rootError}</p>}
            <Button type="submit" disabled={!user || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PreferencesCard() {
  const [mode, setMode] = useState<Mode>(readMode)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark")
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      /* storage unavailable */
    }
  }, [mode])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Stored in this browser.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Theme</p>
          <div role="group" aria-label="Theme" className="flex gap-2">
            {(["light", "dark"] as const).map((m) => (
              <Button key={m} type="button" variant={mode === m ? "default" : "outline"} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m === "light" ? "Light" : "Dark"}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium">Language</label>
          <select id="language" disabled className="flex h-9 w-full max-w-xs rounded-md border bg-transparent px-3 text-sm opacity-60">
            <option>English</option>
          </select>
          <p className="text-xs text-muted-foreground">Placeholder: wire it to your i18n setup.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Your profile and preferences." />
      <ProfileCard />
      <PreferencesCard />
    </div>
  )
}
