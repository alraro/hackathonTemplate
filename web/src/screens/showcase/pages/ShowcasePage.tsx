import { useEffect, useMemo, type ComponentType, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { effects } from "@/components/effects"
import { effects2 } from "@/components/effects/index.2"
import { applyPreset, type Preset } from "@/lib/applyPreset"
import identity from "@/design/identity.json"
import theme from "@/design/theme.json"
import "@/design/generated/preset-fonts.css" // fonts of every preset, so the switch shows each look

const modules = import.meta.glob<Preset>("/src/design/presets/*.json", { eager: true, import: "default" })
const presets: Record<string, Preset> = Object.fromEntries(Object.values(modules).map((p) => [p.name, p]))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, ComponentType<any>> = { ...effects, ...effects2 }

const SWATCHES = ["background", "foreground", "primary", "secondary", "muted", "accent", "destructive", "border"]
const SCALE = [
  ["text-4xl font-display", "Display 4xl"],
  ["text-2xl font-display", "Heading 2xl"],
  ["text-lg", "Body lg"],
  ["text-sm", "Body sm"],
  ["text-xs font-mono", "Mono xs"],
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl">{title}</h2>
      {children}
    </section>
  )
}

/** Demo for one preset effect; each effect has its own props. */
function EffectDemo({ name }: { name: string }) {
  const C = registry[name]
  if (!C) return <p className="text-sm text-muted-foreground">Unknown effect: {name}</p>
  switch (name) {
    case "SplitTextReveal":
    case "GlitchText":
    case "DecryptText":
      return <C text="Signature effect" className="text-2xl font-display" />
    case "DrawnUnderline":
      return <C className="text-2xl font-display">Underlined words</C>
    case "Marquee":
      return <C items={["NEW", "LOUD", "RAW", "BOLD"]} className="font-display text-xl" />
    case "HardShadowPress":
    case "SquishyPress":
      return <C className="rounded-md border bg-primary px-4 py-2 text-primary-foreground">Press me</C>
    case "ConfettiBurst":
      return <C>{(fire: () => void) => <Button onClick={fire}>Celebrate</Button>}</C>
    case "SpotlightCard":
    case "BorderBeam":
    case "GridBackground":
      return <C className="rounded-lg border p-6">Hover and look</C>
    case "ScrollProgressRule":
      return (
        <p className="text-sm text-muted-foreground">
          A rule at the top fills as you scroll.
          <C />
        </p>
      )
    default:
      return (
        <div className="relative h-24 overflow-hidden rounded-lg border">
          <C />
        </div>
      )
  }
}

export default function ShowcasePage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get("preset")
  const active = requested && presets[requested] ? requested : null
  const names = useMemo(() => Object.keys(presets).sort(), [])

  const { resolvedTheme } = useTheme() // re-apply when light/dark flips: the palette depends on it
  useEffect(() => {
    if (!active) return
    return applyPreset(presets[active])
  }, [active, resolvedTheme])

  const choose = (name: string | null) => setParams(name ? { preset: name } : {}, { replace: true })
  const shown = active ? presets[active] : (theme as unknown as Preset)

  return (
    <div className="space-y-10 pb-24">
      <PageHeader title="Showcase" />

      <section className="rounded-lg border bg-card p-6 shadow-md sm:p-10">
        <h1 className="font-display text-4xl sm:text-5xl">{identity.name}</h1>
        <p className="mt-3 max-w-prose text-lg text-muted-foreground">{identity.tagline}</p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">preset: {shown.name}</p>
      </section>

      <Section title="Type scale">
        <div className="space-y-2">
          {SCALE.map(([cls, label]) => (
            <p key={label} className={cls}>
              {label}: The quick brown fox
            </p>
          ))}
        </div>
      </Section>

      <Section title="Palette">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((c) => (
            <div key={c} className="overflow-hidden rounded-md border text-xs">
              <div className="h-12" style={{ background: `var(--${c})` }} />
              <div className="p-2 font-mono">{c}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Components">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buttons and form</CardTitle>
              <CardDescription>Default, secondary, destructive, outline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="showcase-email">Email</Label>
                <Input id="showcase-email" placeholder="you@example.com" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast("Toast from the showcase")}>
                  Toast
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog title</DialogTitle>
                      <DialogDescription>Dialog body text in the current preset.</DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["Alpha", "Beta", "Gamma"].map((n, i) => (
                    <TableRow key={n}>
                      <TableCell>{n}</TableCell>
                      <TableCell>{i === 1 ? "Draft" : "Live"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Signature effects">
        {shown.effects.length === 0 ? (
          <p className="text-sm text-muted-foreground">This preset has no signature effects.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.effects.map((n) => (
              <div key={`${shown.name}-${n}`} className="space-y-2 rounded-lg border p-4">
                <p className="font-mono text-xs text-muted-foreground">{n}</p>
                <EffectDemo name={n} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Wow moment sketch">
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          Sketch the Wow moment screen here.
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-3 z-50 flex justify-center px-3">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border bg-popover p-1 text-popover-foreground shadow-lg">
          <Button size="sm" variant={active ? "ghost" : "default"} className="rounded-full" onClick={() => choose(null)}>
            theme
          </Button>
          {names.map((n) => (
            <Button key={n} size="sm" variant={active === n ? "default" : "ghost"} className="rounded-full" onClick={() => choose(n)}>
              {n}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
