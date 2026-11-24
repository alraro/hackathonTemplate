import { useState } from "react"
import { PageHeader } from "@/components/common/PageHeader"
import { QueryState } from "@/components/common/QueryState"
import { ReportView } from "@/components/common/ReportView"
import { useReport, useRuns } from "../api"

export default function DashboardPage() {
  const runs = useRuns().data ?? []
  const [picked, setPicked] = useState("")
  const run = picked || runs[0] || ""
  const query = useReport(run)
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Metrics and charts of a data run."
        actions={
          <select
            aria-label="Run"
            value={run}
            onChange={(e) => setPicked(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {runs.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        }
      />
      <QueryState query={query} empty={{ title: "No report", description: "Run `make data-run` and commit the report." }}>
        {(report) => <ReportView report={report} />}
      </QueryState>
    </>
  )
}
