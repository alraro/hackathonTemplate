import { ExportMenu } from "./ExportMenu"
import { KpiTile } from "./KpiTile"
import { ReportChart, type ReportChartModel } from "./ReportChart"

export type ReportModel = {
  run: string
  pipeline: string
  model: string
  metrics: Record<string, number>
  charts: ReportChartModel[]
  summary: string
}

/** Metrics as KPI tiles, charts in a responsive grid (1 col, 2 at md, 3 at lg), then the summary. */
export function ReportView({ report }: { report: ReportModel }) {
  const metrics = Object.entries(report.metrics)
  return (
    <div className="space-y-6">
      {metrics.length > 0 ? (
        <div className="flex justify-end" data-no-print>
          <ExportMenu
            rows={metrics.map(([metric, value]) => ({ metric, value }))}
            columns={[{ key: "metric", label: "Metric" }, { key: "value", label: "Value" }]}
            filename={`report-${report.run}`}
          />
        </div>
      ) : null}
      {metrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {metrics.map(([k, v]) => (
            <KpiTile key={k} label={k.replace(/_/g, " ")} value={v} hint={`${report.pipeline} / ${report.model}`} />
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {report.charts.map((c) => (
          <ReportChart key={c.id} chart={c} />
        ))}
      </div>
      {report.summary ? <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{report.summary}</p> : null}
    </div>
  )
}
