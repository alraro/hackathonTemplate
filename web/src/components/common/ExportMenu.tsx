import { Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { errorText } from "@/lib/errors"
import "@/styles/print.css"

export type ExportColumn = { key: string; label: string }
export type ExportRow = Record<string, unknown>

type ExportMenuProps = {
  /** The rows, or a loader called on export (use it to fetch every page, not only the visible one). */
  rows: ExportRow[] | (() => Promise<ExportRow[]>)
  columns: ExportColumn[]
  filename: string
}

const cellText = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v))

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

/** RFC 4180 CSV. */
export function toCsv(rows: ExportRow[], columns: ExportColumn[]): string {
  const esc = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
  const lines = [columns.map((c) => esc(c.label)), ...rows.map((r) => columns.map((c) => esc(cellText(r[c.key]))))]
  return lines.map((l) => l.join(",")).join("\r\n")
}

async function exportXlsx(rows: ExportRow[], columns: ExportColumn[], filename: string) {
  const { default: writeExcelFile } = await import("write-excel-file/browser")
  const header = columns.map((c) => ({ value: c.label, fontWeight: "bold" as const }))
  const body = rows.map((r) =>
    columns.map((c) => {
      const v = r[c.key]
      return typeof v === "number" ? { value: v, type: Number } : { value: cellText(v), type: String }
    }),
  )
  await writeExcelFile([header, ...body]).toFile(`${filename}.xlsx`)
}

/** Client-side export of the given rows: CSV, XLSX, or PDF through the browser print dialog (see styles/print.css). */
export function ExportMenu({ rows, columns, filename }: ExportMenuProps) {
  const resolve = async () => (typeof rows === "function" ? await rows() : rows)
  const run = (job: (all: ExportRow[]) => void | Promise<void>) => async () => {
    try {
      await job(await resolve())
    } catch (e) {
      toast.error(errorText(e, "Export failed"))
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-no-print>
          <Download aria-hidden /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-no-print>
        {/* BOM so Excel reads the CSV as UTF-8. */}
        <DropdownMenuItem onSelect={() => void run((all) => download(new Blob(["﻿" + toCsv(all, columns)], { type: "text/csv;charset=utf-8" }), `${filename}.csv`))()}>
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void run((all) => exportXlsx(all, columns, filename))()}>XLSX</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.print()}>PDF (print)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
