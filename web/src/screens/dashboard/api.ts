import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { ReportModel } from "@/components/common/ReportView"

// Known runs: the committed fixtures (one JSON per run). Add runs by dropping <run>.json here
// (copy backend/data/outputs/<run>/report.json). Backend: GET /api/data/reports/{run}.
const fixtures = import.meta.glob<ReportModel>("./fixtures/*.json", { eager: true, import: "default" })
export const RUNS = Object.keys(fixtures).map((p) => p.split("/").pop()!.replace(".json", ""))
export const fixtureFor = (run: string) => fixtures[`./fixtures/${run}.json`]

export function useReport(run: string) {
  return useQuery({
    queryKey: ["data-report", run],
    queryFn: async (): Promise<ReportModel> => {
      // Untyped path on purpose: pruning the data Module removes this route from the Contract, and the screen must still compile.
      const { data } = (await api.GET(`/api/data/reports/${encodeURIComponent(run)}` as never, {} as never)) as { data?: ReportModel }
      if (!data) throw new Error(`No report for run '${run}'`)
      return data
    },
  })
}
