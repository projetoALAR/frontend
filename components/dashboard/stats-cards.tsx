"use client"

import { ArrowUpRight, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { DashboardResumoError } from "@/components/dashboard/dashboard-resumo-error"
import { ListSkeleton } from "@/components/shared/list-skeleton"

export function StatsCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const router = useRouter()
  const { data, loading, error, reload } = useDashboardResumo()

  const stats = [
    {
      title: "Total de Casos",
      value: String(data?.totalProcessos ?? 0),
      increase: `${data?.totalClientes ?? 0} clientes`,
      bgColor: "bg-primary",
      textColor: "text-primary-foreground",
      delay: "0ms",
      filter: null as string | null,
    },
    {
      title: "Casos Concluídos",
      value: String(data?.processosConcluidos ?? 0),
      increase: `${data?.percentualConclusao ?? 0}% do total`,
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "100ms",
      filter: "concluidas",
    },
    {
      title: "Em Andamento",
      value: String(data?.processosAtivos ?? 0),
      increase: "Casos ativos",
      bgColor: "bg-card",
      textColor: "text-foreground",
      delay: "200ms",
      filter: "ativas",
    },
  ]

  const handleCardClick = (filter: string | null) => {
    if (filter) router.push(`/tasks?filter=${filter}`)
    else router.push("/tasks")
  }

  if (error && !data) {
    return (
      <DashboardResumoError message={error} onRetry={reload} loading={loading} />
    )
  }

  if (loading && !data) {
    return <ListSkeleton variant="stats" count={3} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick(stat.filter)}
          style={{ animationDelay: stat.delay }}
          className={`${stat.bgColor} ${stat.textColor} p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${
            hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
            <div
              className={`w-6 h-6 rounded-full ${
                stat.bgColor === "bg-primary" ? "bg-primary-foreground/20" : "bg-primary"
              } flex items-center justify-center transition-transform duration-300 ${
                hoveredCard === index ? "rotate-45" : ""
              }`}
            >
              <ArrowUpRight className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-2">{stat.value}</p>
          <div className="flex items-center gap-1.5 text-xs opacity-80">
            <TrendingUp className="w-3 h-3" />
            <span>{stat.increase}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
