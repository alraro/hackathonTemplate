import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api, API_MODE } from "../../lib/api/client";
import { registerFixtures } from "../../lib/api/fixturesFetch";
import type { components } from "../../lib/api/schema";

// Data layer for the items resource. Copy this file, swap "/api/items" and the schema types for your domain.
export type Item = components["schemas"]["ItemRead"];
export type ItemInput = components["schemas"]["ItemCreate"];
export type ItemStatus = components["schemas"]["ItemStatus"];
export const STATUSES: ItemStatus[] = ["todo", "doing", "done"];
export const PAGE_SIZE = 10;

// Fixtures mode: created/edited rows stay in memory for the session.
if (API_MODE === "fixtures") registerFixtures("/api/items", require("./fixtures.json"));

/** Same fields as the web form; title is required. */
export const itemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string(),
  status: z.enum(["todo", "doing", "done"]),
  category: z.string(),
});

/** Throw on an API error so TanStack Query surfaces it (QueryState shows it). */
function check<T>(res: { data?: T; error?: unknown }): T {
  if (res.error !== undefined || res.data === undefined) {
    const detail = (res.error as { detail?: unknown } | undefined)?.detail;
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.data;
}

/** Infinite list with `limit`/`offset` paging; `q` is the (already debounced) search text. */
export function useItems(q: string) {
  return useInfiniteQuery({
    queryKey: ["items", "list", q],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      check(await api.GET("/api/items", { params: { query: { q: q || undefined, limit: PAGE_SIZE, offset: pageParam } } })),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? loaded : undefined;
    },
  });
}

export function useItem(id: number | undefined) {
  return useQuery({
    queryKey: ["items", "detail", id],
    enabled: id !== undefined,
    queryFn: async () => check(await api.GET("/api/items/{item_id}", { params: { path: { item_id: id! } } })),
  });
}

export function useSaveItem(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ItemInput) =>
      id === undefined
        ? check(await api.POST("/api/items", { body: input }))
        : check(await api.PATCH("/api/items/{item_id}", { params: { path: { item_id: id } }, body: input })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.DELETE("/api/items/{item_id}", { params: { path: { item_id: id } } });
      if (res.error !== undefined) throw new Error("Delete failed");
    },
    // Skip the deleted row's own detail query: refetching it would 404 and flash the error state before we navigate back.
    onSuccess: (_, id) =>
      qc.invalidateQueries({ queryKey: ["items"], predicate: (q) => !(q.queryKey[1] === "detail" && q.queryKey[2] === id) }),
  });
}
