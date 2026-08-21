"use client"

import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { formatDatePt } from "@/lib/format"
import { casoHref, rotas } from "@/lib/app-routes"

export function Reminders() {
  const router = useRouter()
  const { data } = useDashboardResumo()
  const processos = data?.proximosPrazos?.processos ?? []
  const compromissos = data?.proximosPrazos?.compromissos ?? []

  const deadlines = [
    ...processos.map((p) => ({
      id: `p-${p.id}`,
      entityId: p.id,
      processoId: p.id as string | null,
      tipo: "processo" as const,
      title: p.titulo || p.numero,
      project: p.status,
      dueDate: formatDatePt(p.prazo),
    })),
    ...compromissos.map((c) => ({
      id: `c-${c.id}`,
      entityId: c.id,
      processoId: c.processoId,
      tipo: "compromisso" as const,
      title: c.titulo,
      project: c.processo?.numero ? `Proc. ${c.processo.numero}` : "Agenda",
      dueDate: formatDatePt(c.dataHora),
    })),
  ].slice(0, 5)

  return (
    <Card className="border-border/80 p-5 gap-4">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Prazos próximos
      </h2>
      <div className="space-y-1">
        {deadlines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum prazo pendente.
          </p>
        ) : (
          deadlines.map((item) => (
            <button
              type="button"
              key={item.id}
              className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-secondary/70"
              onClick={() => {
                if (item.tipo === "processo") {
                  router.push(casoHref(item.entityId))
                } else if (item.processoId) {
                  router.push(casoHref(item.processoId))
                } else {
                  router.push(rotas.agenda)
                }
              }}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium leading-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.project}</p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {item.dueDate}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}
