"use client"

import { Card } from "@/components/ui/card"
import { Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { formatDatePt } from "@/lib/format"
import { casoHref } from "@/lib/caso-href"

export function Reminders() {
  const router = useRouter()
  const { data } = useDashboardResumo()
  const processos = data?.proximosPrazos?.processos ?? []
  const compromissos = data?.proximosPrazos?.compromissos ?? []

  const deadlines = [
    ...processos.map((p) => ({
      id: `p-${p.id}`,
      entityId: p.id,
      tipo: "processo" as const,
      title: p.titulo || p.numero,
      project: p.status,
      dueDate: formatDatePt(p.prazo),
    })),
    ...compromissos.map((c) => ({
      id: `c-${c.id}`,
      entityId: c.id,
      tipo: "compromisso" as const,
      title: c.titulo,
      project: c.processo?.numero ? `Proc. ${c.processo.numero}` : "Agenda",
      dueDate: formatDatePt(c.dataHora),
    })),
  ].slice(0, 5)

  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "500ms" }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-6">Prazos Próximos</h2>
      <div className="space-y-3">
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum prazo pendente.</p>
        ) : (
          deadlines.map((item) => (
            <button
              type="button"
              key={item.id}
              className="w-full text-left bg-secondary rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
              onClick={() => {
                if (item.tipo === "processo") {
                  router.push(casoHref(item.entityId))
                } else {
                  router.push("/calendar")
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.project}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3 h-3 text-primary" />
                    <p className="text-xs font-medium text-primary">Prazo: {item.dueDate}</p>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}
