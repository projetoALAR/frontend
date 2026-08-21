"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"

export function TeamSummaryCard() {
  const { data } = useDashboardResumo()
  const teamStats = [
    { label: "Total de Casos", value: String(data?.totalProcessos ?? 0) },
    { label: "Em Andamento", value: String(data?.processosAtivos ?? 0) },
    { label: "Concluídos", value: String(data?.processosConcluidos ?? 0) },
  ]
  const productivity = data?.percentualConclusao ?? 0

  return (
    <Card className="overflow-hidden border-border/80 p-5 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Resumo da equipe
        </h2>
      </div>

      <div className="mb-1 grid grid-cols-3 gap-2">
        {teamStats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-secondary/70 p-2.5 text-center">
            <p className="text-lg font-semibold tabular-nums text-foreground">{stat.value}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Taxa de conclusão</p>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs font-semibold">{productivity}%</span>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${productivity}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {data?.totalMembros ?? 0} membro(s) na equipe · {data?.totalClientes ?? 0} cliente(s)
      </p>
    </Card>
  )
}
