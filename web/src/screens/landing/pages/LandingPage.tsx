import { Link } from "react-router"
import features from "@features"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/app/layouts/AppLayout"
import identity from "@design/identity.json"

// Edit these to fit the pitch. Sections render as numbered rows, not icon cards.
const SECTIONS = [
  { title: "Start from the problem", body: "Say who hurts today and what they do about it. One concrete person beats a market size." },
  { title: "Show the product doing its one job", body: "Replace this with the core flow of your demo. If it needs a paragraph to explain, cut it." },
  { title: "Finish with the proof", body: "A number, a quote or a live result from the Identity of your project. Then ask for the next step." },
]

export default function LandingPage() {
  const cta = features.auth ? { to: "/signup", label: "Create an account" } : { to: "/", label: "Open the app" }
  return (
    <div className="space-y-16 py-4 md:space-y-24 md:py-10">
      <section className="grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{APP_NAME}</p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            {identity.tagline}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to={cta.to}>{cta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="#how">How it works</a>
            </Button>
          </div>
        </div>
        <div aria-hidden className="aspect-[4/3] rounded-xl border bg-muted/50 p-4 shadow-sm md:aspect-square">
          <div className="h-full rounded-lg border border-dashed bg-background/60" />
        </div>
      </section>

      <section id="how" className="border-t">
        {SECTIONS.map((s, i) => (
          <div key={s.title} className="grid gap-2 border-b py-6 md:grid-cols-[4rem_1fr_1.2fr] md:gap-8 md:py-8">
            <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
            <p className="text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-2xl font-semibold tracking-tight">Ready to see it work?</p>
        <Button asChild size="lg">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      </section>
    </div>
  )
}
