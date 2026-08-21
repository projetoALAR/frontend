"use client"

import { Card } from "@/components/ui/card"
import { useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"

const barColor = "oklch(0.48 0.18 250)"

export function ProjectAnalytics() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const { data } = useDashboardResumo()

  const chartData = useMemo(() => {
    const statuses = data?.processosPorStatus ?? []
    if (statuses.length === 0) {
      return [{ phase: "Sem dados", cases: 0 }]
    }
    return statuses.map((s) => ({
      phase: s.status || "Sem status",
      cases: s._count.status,
    }))
  }, [data?.processosPorStatus])

  const maxValue = Math.max(...chartData.map((d) => d.cases), 1)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-foreground text-background px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
          <p className="font-bold">{payload[0].value} Caso{payload[0].value !== 1 ? "s" : ""}</p>
          <p className="text-[10px] opacity-80">{payload[0].payload.phase}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-border/80 bg-card p-5 gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Volume por status
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-2 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 40, right: 20, left: -25, bottom: 20 }}>
              <CartesianGrid strokeDasharray="0" stroke="currentColor" vertical={false} className="text-muted/10" />
              <XAxis
                dataKey="phase"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-muted-foreground"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-muted-foreground"
                domain={[0, maxValue]}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="cases"
                radius={[8, 8, 0, 0]}
                onMouseEnter={(_, index) => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColor}
                    fillOpacity={hoveredBar === null || hoveredBar === index ? 1 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}
