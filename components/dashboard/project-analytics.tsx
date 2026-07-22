"use client"

import { Card } from "@/components/ui/card"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { FileText, Gavel, Scale, LogOut } from "lucide-react"

const chartData = [
  { phase: "Petição Inicial", cases: 5, icon: FileText },
  { phase: "Instrução", cases: 4, icon: Gavel },
  { phase: "Fase Recursal", cases: 2, icon: Scale },
  { phase: "Execução", cases: 1, icon: LogOut },
]

const barColor = "oklch(0.48 0.18 250)"

export function ProjectAnalytics() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const maxValue = Math.max(...chartData.map((d) => d.cases))

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
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up bg-card"
      style={{ animationDelay: "400ms" }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Volume de Processos por Fase</h2>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="w-full h-72 mb-8 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 40, right: 20, left: -25, bottom: 20 }}>
              <CartesianGrid strokeDasharray="0" stroke="currentColor" vertical={false} className="text-muted/10" />
              <XAxis
                dataKey="phase"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 13 }}
                className="text-muted-foreground"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-muted-foreground"
                ticks={[0, 1, 2, 3, 4, 5]}
                domain={[0, 5]}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="cases"
                radius={[12, 12, 0, 0]}
                maxBarSize={100}
                onMouseEnter={(data, index) => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColor}
                    className="transition-all duration-300"
                    style={{
                      filter:
                        hoveredBar === index ? "brightness(1.4) drop-shadow(0 6px 16px rgba(66, 120, 225, 0.6))" : "brightness(1)",
                      transformOrigin: "center bottom",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Icons and labels below chart */}
        <div className="grid grid-cols-4 gap-6 w-full px-4 mb-6">
          {chartData.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex flex-col items-center text-center gap-2">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.cases} Caso{item.cases !== 1 ? "s" : ""}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{item.phase}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Fonte: Distribuição Atual de Processos em Andamento (Total: 12)
        </p>
      </div>
    </Card>
  )
}
