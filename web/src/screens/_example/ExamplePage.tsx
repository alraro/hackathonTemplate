import { PageHeader } from "@/components/common/PageHeader"
import { QueryState } from "@/components/common/QueryState"
import { Card, CardContent } from "@/components/ui/card"
import { useExamples } from "./api"

// The screen pattern in one page. Not registered as a route: copy this folder to
// screens/<your-screen>/ (page under pages/), then add one entry to screenRoutes in app/routes.tsx.
//
// Rules of the pattern:
//  - data comes from a hook in api.ts, never fetched inside the component
//  - every data view is wrapped in <QueryState>: it handles loading, error (with retry) and empty
//  - the empty state carries a call to action
export default function ExamplePage() {
  const query = useExamples()
  return (
    <>
      <PageHeader title="Example" description="Copy me for your domain screen." />
      <QueryState query={query} empty={{ title: "Nothing here yet", description: "Create the first example." }}>
        {(rows) => (
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-1">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </>
  )
}
