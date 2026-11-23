import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Scatter, ScatterChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { EmptyState } from "./EmptyState"

export type ReportChartModel = {
  id: string
  kind: "line" | "bar" | "area" | "scatter" | "pie"
  title: string
  x: string
  series: { key: string; label: string }[]
  data: Record<string, unknown>[]
}

// Colours come from the chart tokens --chart-1..5, handed to shadcn's ChartContainer through a ChartConfig.
const color = (i: number) => `var(--chart-${(i % 5) + 1})`
const configOf = (series: ReportChartModel["series"]): ChartConfig =>
  Object.fromEntries(series.map((s, i) => [s.key, { label: s.label, color: color(i) }]))

function Plot({ chart }: { chart: ReportChartModel }) {
  const { kind, x, series, data } = chart
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={x} tickLine={false} axisLine={false} interval={0} angle={data.length > 6 ? -30 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 70 : 30} tick={{ fontSize: 11 }} />
      <YAxis tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11 }} />
      <ChartTooltip content={<ChartTooltipContent />} />
      {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
    </>
  )
  if (kind === "pie") {
    const s = series[0]
    return (
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey={x} />} />
        <ChartLegend content={<ChartLegendContent nameKey={x} />} />
        <Pie data={data} dataKey={s.key} nameKey={x} label>
          {data.map((_, i) => (
            <Cell key={i} fill={color(i)} />
          ))}
        </Pie>
      </PieChart>
    )
  }
  if (kind === "scatter") {
    return (
      <ScatterChart>
        {axes}
        {series.map((s, i) => (
          <Scatter key={s.key} name={s.label} data={data.map((d) => ({ [x]: d[x], y: d[s.key] }))} dataKey="y" fill={color(i)} />
        ))}
      </ScatterChart>
    )
  }
  const Chart = kind === "line" ? LineChart : kind === "area" ? AreaChart : BarChart
  return (
    <Chart data={data}>
      {axes}
      {series.map((s, i) =>
        kind === "line" ? (
          <Line key={s.key} dataKey={s.key} name={s.label} stroke={color(i)} strokeWidth={2} dot={false} />
        ) : kind === "area" ? (
          <Area key={s.key} dataKey={s.key} name={s.label} stroke={color(i)} fill={color(i)} fillOpacity={0.25} />
        ) : (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={color(i)} radius={[3, 3, 0, 0]} />
        ),
      )}
    </Chart>
  )
}

/** Renders any report Chart (line|bar|area|scatter|pie) with no per-chart code, inside shadcn's ChartContainer. */
export function ReportChart({ chart }: { chart: ReportChartModel }) {
  const empty = chart.data.length === 0 || chart.series.length === 0
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyState title="No data" description="This chart has no points yet." />
        ) : (
          <ChartContainer config={configOf(chart.series)} className="aspect-auto h-64 w-full" role="img" aria-label={chart.title}>
            {Plot({ chart })}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
