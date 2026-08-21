"use client"

import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { DashboardResumoError } from "@/components/dashboard/dashboard-resumo-error"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { casosListaHref, rotas } from "@/lib/app-routes"
import { cn } from "@/lib/utils"

export function StatsCards() {
  const router = useRouter()
  const { data, loading, error, reload } = useDashboardResumo()

  const stats = [
    {
      title: "Total de casos",
      value: String(data?.totalProcessos ?? 0),
      hint: `${data?.totalClientes ?? 0} clientes`,
      filter: null as string | null,
      emphasis: true,
    },
    {
      title: "Concluídos",
      value: String(data?.processosConcluidos ?? 0),
      hint: `${data?.percentualConclusao ?? 0}% do total`,
      filter: "concluidas",
      emphasis: false,
    },
    {
      title: "Em andamento",
      value: String(data?.processosAtivos ?? 0),
      hint: "Casos ativos",
      filter: "ativas",
      emphasis: false,
    },
  ]

  const handleCardClick = (filter: string | null) => {
    if (filter) router.push(casosListaHref({ filter }))
    else router.push(rotas.casos)
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
    <div className="grid grid-cols-1 divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {stats.map((stat) => (
        <button
          key={stat.title}
          type="button"
          onClick={() => handleCardClick(stat.filter)}
          className={cn(
            "group p-4 text-left transition-colors hover:bg-secondary/50 sm:p-5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          )}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stat.title}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
              stat.emphasis ? "text-primary" : "text-foreground",
            )}
          >
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
            {stat.hint}
          </p>
        </button>
      ))}
    </div>
  )
}
