"use client"

import { Card } from "@/components/ui/card"
import { Users, CheckCircle, Clock, Target, ArrowUpRight } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { DashboardResumoError } from "@/components/dashboard/dashboard-resumo-error"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { ListSkeleton } from "@/components/shared/list-skeleton"

export function AnalyticsContent() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const router = useRouter()
  const { data, loading, error, reload } = useDashboardResumo()

  const stats = useMemo(
    () => [
      {
        title: "Casos Concluídos",
        value: String(data?.processosConcluidos ?? 0),
        detail: `${data?.percentualConclusao ?? 0}% do total`,
        icon: CheckCircle,
        href: "/tasks?filter=concluidas",
      },
      {
        title: "Casos Ativos",
        value: String(data?.processosAtivos ?? 0),
        detail: `${data?.totalProcessos ?? 0} no total`,
        icon: Target,
        href: "/tasks?filter=ativas",
      },
      {
        title: "Membros da Equipe",
        value: String(data?.totalMembros ?? 0),
        detail: "cadastrados",
        icon: Users,
        href: "/team",
      },
      {
        title: "Clientes",
        value: String(data?.totalClientes ?? 0),
        detail: "cadastrados",
        icon: Clock,
        href: "/clients",
      },
    ],
    [data],
  )

  if (error && !data) {
    return (
      <DashboardResumoError message={error} onRetry={reload} loading={loading} />
    )
  }

  if (loading && !data) {
    return <ListSkeleton variant="stats" count={4} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            role="link"
            tabIndex={0}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push(stat.href)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                router.push(stat.href)
              }
            }}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`bg-card text-foreground p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${
              hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
              </div>
              <div
                className={`w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 ${
                  hoveredCard === index ? "rotate-45" : ""
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectAnalytics />

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Distribuição de Casos</h3>
          <div className="space-y-4">
            {[
              { name: "Em Andamento", count: data?.processosAtivos ?? 0, color: "bg-primary" },
              { name: "Concluídos", count: data?.processosConcluidos ?? 0, color: "bg-blue-400" },
            ].map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300 animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{item.count}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              Valores atuais do workspace — sem projeção de tendência.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
