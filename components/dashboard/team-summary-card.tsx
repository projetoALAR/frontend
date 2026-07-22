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
    <Card
      className="p-4 transition-all duration-500 hover:shadow-xl animate-slide-in-up overflow-hidden"
      style={{ animationDelay: "900ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Resumo da Equipe</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {teamStats.map((stat) => (
          <div key={stat.label} className="bg-secondary rounded-lg p-2.5 text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
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
