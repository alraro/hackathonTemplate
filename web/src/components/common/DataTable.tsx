import { flexRender, tableFeatures, useTable, type ColumnDef, type RowData } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportMenu } from "./ExportMenu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Core features only: the server filters and paginates, the table just renders rows.
const features = tableFeatures({})

export type DataTableColumn<T extends RowData> = ColumnDef<typeof features, T>

type DataTableProps<T extends RowData> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  /** Filename (no extension) for the Export button above the table; false hides it. Columns with an accessorKey and a string header are exported. */
  exportName?: string | false
  /** Server-side pagination: pass it to show the pager. */
  pagination?: { offset: number; limit: number; total: number; onOffsetChange: (offset: number) => void }
}

/** shadcn table driven by TanStack Table. Wrap it in <QueryState> at the call site. */
export function DataTable<T extends RowData>({ columns, data, getRowId, onRowClick, exportName = "export", pagination }: DataTableProps<T>) {
  const table = useTable({ features, columns, data, getRowId })
  const from = pagination && pagination.total > 0 ? pagination.offset + 1 : 0
  const to = pagination ? Math.min(pagination.offset + pagination.limit, pagination.total) : 0

  const exportColumns = columns.flatMap((c) => {
    const key = "accessorKey" in c ? String(c.accessorKey) : ""
    return key && typeof c.header === "string" ? [{ key, label: c.header }] : []
  })

  return (
    <div className="space-y-3">
      {exportName && exportColumns.length > 0 ? (
        <div className="flex justify-end" data-no-print>
          <ExportMenu rows={data as Record<string, unknown>[]} columns={exportColumns} filename={exportName} />
        </div>
      ) : null}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination ? (
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            {from}-{to} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset <= 0}
              onClick={() => pagination.onOffsetChange(Math.max(0, pagination.offset - pagination.limit))}
            >
              <ChevronLeft aria-hidden /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset + pagination.limit >= pagination.total}
              onClick={() => pagination.onOffsetChange(pagination.offset + pagination.limit)}
            >
              Next <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
