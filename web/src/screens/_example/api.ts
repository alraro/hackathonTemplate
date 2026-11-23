import { useQuery } from "@tanstack/react-query"

// Minimal data layer to copy for a new screen (the full pattern is screens/crud/api.ts).
//
// 1. Add your resource in the backend, run `make openapi api-client`: this gives you typed paths in
//    lib/api/schema.d.ts and screens/<resource>/fixtures.json (served by MSW in fixtures mode).
// 2. Replace the fetch below with the typed client, e.g.
//      const { data, error } = await api.GET("/api/<resource>")
//    This example uses fetch only because "_example" is not a real backend resource.
export type Example = { id: number; title: string; description: string; status: string; created_at: string }

export function useExamples() {
  return useQuery({
    queryKey: ["_example", "list"],
    queryFn: async (): Promise<Example[]> => {
      const res = await fetch("/api/_example")
      if (!res.ok) throw new Error("Could not load examples")
      return (await res.json()).items
    },
  })
}
