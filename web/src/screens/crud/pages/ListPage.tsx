import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DataTable, type DataTableColumn } from "@/components/common/DataTable"
import { PageHeader } from "@/components/common/PageHeader"
import { QueryState } from "@/components/common/QueryState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PAGE_SIZE, STATUSES, useDeleteItem, useItems, type Item } from "../api"
import { DeleteDialog } from "../components/DeleteDialog"

// Screen pattern: filters live in the URL (shareable, back-button safe), data comes from a query hook,
// the table sits inside <QueryState>, destructive actions go through a confirm dialog and a toast.
export default function ListPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get("q") ?? ""
  const status = STATUSES.find((s) => s === params.get("status"))
  const category = params.get("category") ?? ""
  const offset = Number(params.get("offset")) || 0

  const query = useItems({ q, status, category, offset })
  const del = useDeleteItem()
  const [toDelete, setToDelete] = useState<Item | null>(null)

  /** Changing a filter resets the page; empty values leave the URL. */
  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== "offset") next.delete("offset")
        return next
      },
      { replace: true },
    )

  const columns: DataTableColumn<Item>[] = [
    { accessorKey: "title", header: "Title", cell: (c) => <span className="font-medium">{c.row.original.title}</span> },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "category", header: "Category" },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (c) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${c.row.original.title}`}
          onClick={(e) => {
            e.stopPropagation()
            setToDelete(c.row.original)
          }}
        >
          <Trash2 aria-hidden />
        </Button>
      ),
    },
  ]

  const newButton = (
    <Button asChild>
      <Link to="/items/new">
        <Plus aria-hidden /> New item
      </Link>
    </Button>
  )
  const filtered = Boolean(q || status || category)

  return (
    <>
      <PageHeader title="Items" actions={newButton} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          type="search"
          placeholder="Search..."
          aria-label="Search"
          value={q}
          onChange={(e) => setParam("q", e.target.value)}
        />
        <select
          aria-label="Status"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={status ?? ""}
          onChange={(e) => setParam("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Input
          className="max-w-40"
          placeholder="Category"
          aria-label="Category"
          value={category}
          onChange={(e) => setParam("category", e.target.value)}
        />
      </div>
      <QueryState
        query={query}
        empty={{
          title: filtered ? "No items match" : "No items yet",
          description: filtered ? "Try other filters." : "Create the first one.",
          action: filtered ? undefined : newButton,
          isEmpty: (d) => d.total === 0,
        }}
      >
        {(data) => (
          <DataTable
            columns={columns}
            data={data.items}
            getRowId={(r) => String(r.id)}
            onRowClick={(r) => void navigate(`/items/${r.id}`)}
            pagination={{ offset, limit: PAGE_SIZE, total: data.total, onOffsetChange: (o) => setParam("offset", o ? String(o) : "") }}
          />
        )}
      </QueryState>
      <DeleteDialog
        name={toDelete?.title ?? null}
        pending={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          del.mutate(toDelete.id, {
            onSuccess: () => toast.success("Item deleted"),
            onError: (e) => toast.error(e.message),
            onSettled: () => setToDelete(null),
          })
        }
      />
    </>
  )
}
