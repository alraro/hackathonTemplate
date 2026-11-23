import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { apiErrorMessage } from "@/lib/errors"
import type { components } from "@/lib/api/schema"

// Data layer for the items resource. Copy this file, swap "/api/items" and the schema types for your domain.
export type Item = components["schemas"]["ItemRead"]
export type ItemInput = components["schemas"]["ItemCreate"]
export type ItemStatus = components["schemas"]["ItemStatus"]
export const STATUSES: ItemStatus[] = ["todo", "doing", "done"]
export const PAGE_SIZE = 10
/** Page size for the export loop: the backend maximum. */
const EXPORT_PAGE_SIZE = 200

export type ItemFilters = { q?: string; status?: ItemStatus; category?: string; offset?: number }

/** Throw on an API error so react-query surfaces it (QueryState shows it, mutations toast it). */
function check<T>(res: { data?: T; error?: unknown }): T {
  if (res.error !== undefined || res.data === undefined) {
    throw new Error(apiErrorMessage(res.error, "Request failed"))
  }
  return res.data
}

export function useItems(f: ItemFilters) {
  return useQuery({
    queryKey: ["items", "list", f],
    placeholderData: keepPreviousData,
    queryFn: async () =>
      check(
        await api.GET("/api/items", {
          params: { query: { q: f.q || undefined, status: f.status, category: f.category || undefined, limit: PAGE_SIZE, offset: f.offset ?? 0 } },
        }),
      ),
  })
}

/** Every row matching the filters: pages through the typed client until `total` (used by the table export). */
export async function fetchAllItems(f: Omit<ItemFilters, "offset">): Promise<Item[]> {
  const rows: Item[] = []
  for (;;) {
    const page = check(
      await api.GET("/api/items", {
        params: { query: { q: f.q || undefined, status: f.status, category: f.category || undefined, limit: EXPORT_PAGE_SIZE, offset: rows.length } },
      }),
    )
    rows.push(...page.items)
    if (page.items.length === 0 || rows.length >= page.total) return rows
  }
}

export function useItem(id: number | undefined) {
  return useQuery({
    queryKey: ["items", "detail", id],
    enabled: id !== undefined,
    // A missing item resolves to null (the pages render "Item not found"); other errors throw.
    queryFn: async () => {
      const res = await api.GET("/api/items/{item_id}", { params: { path: { item_id: id! } } })
      if (res.response.status === 404) return null
      return check(res)
    },
  })
}

export function useSaveItem(id?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ItemInput) =>
      id === undefined
        ? check(await api.POST("/api/items", { body: input }))
        : check(await api.PATCH("/api/items/{item_id}", { params: { path: { item_id: id } }, body: input })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.DELETE("/api/items/{item_id}", { params: { path: { item_id: id } } })
      if (res.error !== undefined) throw new Error("Delete failed")
    },
    // Refresh lists only: invalidating the open detail page would refetch the deleted item (404)
    // before the page navigates away. The stale detail entry is garbage-collected once unused.
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items", "list"] }),
  })
}
