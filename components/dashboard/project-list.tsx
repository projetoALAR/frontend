"use client"

import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { casoHref } from "@/lib/caso-href"

const colors = ["bg-blue-500", "bg-sky-500", "bg-indigo-500", "bg-blue-700", "bg-cyan-600"]

export function ProjectList() {
  const router = useRouter()
  const { data } = useDashboardResumo()
  const projects = (data?.processosRecentes ?? []).map((p, index) => ({
    id: p.id,
    name: p.titulo || p.numero,
    date: formatDatePt(p.prazo),
    color: colors[index % colors.length],
  }))

  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "700ms" }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Casos Recentes</h2>
      </div>
      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum caso recente</p>
        ) : (
          projects.map((project, index) => (
            <div
              key={project.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(casoHref(project.id))}
              style={{ animationDelay: `${800 + index * 100}ms` }}
            >
              <div
                className={`${project.color} w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
              >
                <span className="text-white text-xs font-bold">{project.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{project.name}</p>
                <p className="text-xs text-muted-foreground">Prazo: {project.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
