import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type ReportChartModel = {
  id: string
  kind: "line" | "bar" | "area" | "scatter" | "pie"
  title: string
  x: string
  series: { key: string; label: string }[]
  data: Record<string, unknown>[]
}

// Colours come from the chart tokens --chart-1..5; the fallbacks keep charts readable if a theme omits them.
const FALLBACK = ["oklch(0.65 0.19 255)", "oklch(0.7 0.15 160)", "oklch(0.75 0.15 80)", "oklch(0.65 0.2 25)", "oklch(0.6 0.2 310)"]
const color = (i: number) => `var(--chart-${(i % 5) + 1}, ${FALLBACK[i % 5]})`

function Plot({ chart }: { chart: ReportChartModel }) {
  const { kind, x, series, data } = chart
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={x} tickLine={false} axisLine={false} interval={0} angle={data.length > 6 ? -30 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 70 : 30} tick={{ fontSize: 11 }} />
      <YAxis tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11 }} />
      <Tooltip />
      {series.length > 1 ? <Legend /> : null}
    </>
  )
  if (kind === "pie") {
    const s = series[0]
    return (
      <PieChart>
        <Tooltip />
        <Legend />
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

/** Renders any report Chart (line|bar|area|scatter|pie) with no per-chart code. */
export function ReportChart({ chart }: { chart: ReportChartModel }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" role="img" aria-label={chart.title}>
          <ResponsiveContainer width="100%" height="100%">
            {Plot({ chart })}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
