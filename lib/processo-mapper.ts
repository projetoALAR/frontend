import type { ProcessoApi } from "@/lib/processos-api"
import { formatDatePt } from "@/lib/format"

export type CaseView = {
  id: string
  title: string
  project: string
  priority: string
  dueDate: string
  dueDateIso: string | null
  completed: boolean
  tags: string[]
  numero: string
  status: string
  clienteId: string
  descricao: string | null
  cliente?: ProcessoApi["cliente"]
}

export function mapProcessoToCase(p: ProcessoApi): CaseView {
  const tags = Array.isArray(p.tags) ? (p.tags as string[]) : []
  return {
    id: p.id,
    title: p.titulo || p.descricao || p.numero,
    project: p.status,
    priority: p.prioridade || "Média",
    dueDate: formatDatePt(p.prazo),
    dueDateIso: p.prazo,
    completed: p.concluido,
    tags,
    numero: p.numero,
    status: p.status,
    clienteId: p.clienteId,
    descricao: p.descricao,
    cliente: p.cliente,
  }
}
