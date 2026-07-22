"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp } from "lucide-react"
import { getTotalCases, getActiveCases, getCompletedCases, getCompletionPercentage } from "@/lib/shared-data"

const topMembers = [
  { name: "Alexandra D.", avatar: "AD", tasks: 3 },
  { name: "Edwin A.", avatar: "EA", tasks: 2 },
  { name: "Isaac O.", avatar: "IO", tasks: 2 },
  { name: "David O.", avatar: "DO", tasks: 1 },
]

export function TeamSummaryCard() {
  const teamStats = [
    { label: "Total de Casos", value: String(getTotalCases()) },
    { label: "Em Andamento", value: String(getActiveCases()) },
    { label: "Concluídos", value: String(getCompletedCases()) },
  ]

  const productivity = getCompletionPercentage()

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

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Responsáveis ativos</p>
        <div className="space-y-2">
          {topMembers.map((member) => (
            <div key={member.name} className="flex items-center gap-2.5">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
              </div>
              <span className="text-xs text-muted-foreground">{member.tasks} casos</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
