"use client"

import { Briefcase } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { casoHref } from "@/lib/caso-href"
import { formatDatePt } from "@/lib/format"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { Button } from "@/components/ui/button"
import { rotas } from "@/lib/app-routes"

export function ProjectList() {
  const router = useRouter()
  const { data } = useDashboardResumo()
  const projects = (data?.processosRecentes ?? []).map((p) => ({
    id: p.id,
    name: p.titulo || p.numero,
    date: formatDatePt(p.prazo),
  }))

  return (
    <Card className="border-border/80 p-5 gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Casos recentes
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => router.push(rotas.casos)}
        >
          Ver todos
        </Button>
      </div>
      <div className="space-y-1">
        {projects.length === 0 ? (
          <ListEmptyState
            className="border-0 py-6"
            icon={Briefcase}
            title="Nenhum caso recente"
            description="Quando houver processos, os mais novos aparecem aqui."
          />
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-secondary/70"
              onClick={() => router.push(casoHref(project.id))}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {project.name}
                </p>
                <p className="text-xs text-muted-foreground">Prazo: {project.date}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}
