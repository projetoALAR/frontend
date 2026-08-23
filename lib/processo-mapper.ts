import type { ProcessoApi } from "@/lib/processos-api"
import { formatDatePt } from "@/lib/format"

export type CaseView = {
  id: string
  title: string
  project: string
  priority: string
  dueDate: string
  dueDateIso: string | null
  createdAt: string
  createdAtIso: string
  completed: boolean
  tags: string[]
  numero: string
  status: string
  clienteId: string
  descricao: string | null
  cliente?: ProcessoApi["cliente"]
  responsavelId: string | null
  coResponsavelId: string | null
  responsavel?: ProcessoApi["responsavel"]
  coResponsavel?: ProcessoApi["coResponsavel"]
  tribunalSigla: string | null
  andamentosConsulta: ProcessoApi["andamentosConsulta"]
}

export function mapProcessoToCase(p: ProcessoApi): CaseView {
  const tags = Array.isArray(p.tags) ? (p.tags as string[]) : []
  return {
    id: p.id,
    title: p.titulo || p.descricao || p.numero,
    project: p.status,
    priority: p.prioridade || "Média",
    dueDate: formatDatePt(p.prazo),
    dueDateIso: p.prazo ?? null,
    createdAt: formatDatePt(p.criadoEm),
    createdAtIso: p.criadoEm,
    completed: p.concluido,
    tags,
    numero: p.numero,
    status: p.status,
    clienteId: p.clienteId,
    descricao: p.descricao ?? null,
    cliente: p.cliente,
    responsavelId: p.responsavelId ?? null,
    coResponsavelId: p.coResponsavelId ?? null,
    responsavel: p.responsavel,
    coResponsavel: p.coResponsavel,
    tribunalSigla: p.tribunalSigla ?? null,
    andamentosConsulta: p.andamentosConsulta ?? null,
  }
}
