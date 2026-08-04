"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, CheckCircle, Clock, Target, ArrowUpRight, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"

export function AnalyticsContent() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const router = useRouter()
  const { data, loading } = useDashboardResumo()

  const stats = useMemo(
    () => [
      {
        title: "Casos Concluídos",
        value: String(data?.processosConcluidos ?? 0),
        change: `${data?.percentualConclusao ?? 0}%`,
        trend: "up" as const,
        icon: CheckCircle,
        href: "/tasks?filter=concluidas",
      },
      {
        title: "Casos Ativos",
        value: String(data?.processosAtivos ?? 0),
        change: String(data?.totalProcessos ?? 0),
        trend: "up" as const,
        icon: Target,
        href: "/tasks?filter=ativas",
      },
      {
        title: "Membros da Equipe",
        value: String(data?.totalMembros ?? 0),
        change: "equipe",
        trend: "up" as const,
        icon: Users,
        href: "/team",
      },
      {
        title: "Clientes",
        value: String(data?.totalClientes ?? 0),
        change: "cadastrados",
        trend: "up" as const,
        icon: Clock,
        href: "/clients",
      },
    ],
    [data],
  )

  const statusBars = (data?.processosPorStatus ?? []).map((s) => ({
    name: s.status || "Sem status",
    count: s._count.status,
  }))
  const maxCount = Math.max(...statusBars.map((s) => s.count), 1)

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando relatórios...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => router.push(stat.href)}
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
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              <span className="text-blue-600">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-6">Processos por Status</h3>
          <div className="space-y-4">
            {statusBars.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda</p>
            ) : (
              statusBars.map((item, index) => (
                <div key={item.name} className="space-y-2 animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.count} casos</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

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
          </div>
        </Card>
      </div>
    </div>
  )
}
