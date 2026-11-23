import { useEffect, useState, useSyncExternalStore, type ComponentType } from "react"
import { useNavigate } from "react-router"
import features from "@features"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useItems } from "@/screens/crud/api"
import { navItems } from "@/app/routes"

export type PaletteAction = { id: string; label: string; run: () => void; icon?: ComponentType<{ className?: string }> }

const actions = new Map<string, PaletteAction>()
const listeners = new Set<() => void>()
let snapshot: PaletteAction[] = []

function publish() {
  snapshot = [...actions.values()]
  listeners.forEach((l) => l())
}

/** Add a custom action to the ⌘K palette in one line. Returns an unregister function. */
export function registerAction(action: PaletteAction): () => void {
  actions.set(action.id, action)
  publish()
  return () => {
    actions.delete(action.id)
    publish()
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

/** crud items search: only mounted while the palette is open and the crud Feature is on. */
function ItemResults({ q, go }: { q: string; go: (to: string) => void }) {
  const { data } = useItems({ q })
  if (!data || data.items.length === 0) return null
  return (
    <CommandGroup heading="Items">
      {data.items.map((i) => (
        <CommandItem key={i.id} value={`item ${i.id} ${i.title}`} onSelect={() => go(`/items/${i.id}`)}>
          {i.title}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

/** ⌘K / Ctrl+K palette: screens from routes.tsx (navItems), crud items, and registerAction() entries. */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const navigate = useNavigate()
  const custom = useSyncExternalStore(subscribe, () => snapshot)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const close = () => {
    setOpen(false)
    setQ("")
  }
  const go = (to: string) => {
    close()
    void navigate(to)
  }

  return (
    <CommandDialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <CommandInput placeholder="Go to a screen, find an item..." value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Screens">
          {navItems.map(({ id, to, label, icon: Icon }) => (
            <CommandItem key={id} value={`screen ${label}`} onSelect={() => go(to)}>
              <Icon aria-hidden /> {label}
            </CommandItem>
          ))}
        </CommandGroup>
        {custom.length > 0 ? (
          <CommandGroup heading="Actions">
            {custom.map(({ id, label, run, icon: Icon }) => (
              <CommandItem
                key={id}
                value={`action ${label}`}
                onSelect={() => {
                  close()
                  run()
                }}
              >
                {Icon ? <Icon aria-hidden /> : null} {label}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {open && features.crud && q.trim() ? <ItemResults q={q.trim()} go={go} /> : null}
      </CommandList>
    </CommandDialog>
  )
}
