import type { ProcessoApi } from "@/lib/processos-api"
import { formatDatePt } from "@/lib/format"

export type RelatorioFiltros = {
  busca: string
  status: string
  prioridade: string
  situacao: string
  prazoDe: string
  prazoAte: string
  responsavelId: string
}

export const RELATORIO_FILTROS_VAZIOS: RelatorioFiltros = {
  busca: "",
  status: "ALL",
  prioridade: "ALL",
  situacao: "ALL",
  prazoDe: "",
  prazoAte: "",
  responsavelId: "ALL",
}

function csvCell(valor: string): string {
  if (/[",\n\r]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

function diaIso(prazo?: string | null): string | null {
  if (!prazo) return null
  const d = new Date(prazo)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function filtrarProcessosRelatorio(
  processos: ProcessoApi[],
  filtros: RelatorioFiltros,
): ProcessoApi[] {
  const q = filtros.busca.trim().toLowerCase()
  return processos.filter((p) => {
    if (q) {
      const hay = [p.numero, p.titulo, p.cliente?.nome]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filtros.status !== "ALL" && p.status !== filtros.status) return false
    if (filtros.prioridade !== "ALL" && (p.prioridade || "") !== filtros.prioridade) {
      return false
    }
    if (filtros.situacao === "ativos" && p.concluido) return false
    if (filtros.situacao === "concluidos" && !p.concluido) return false
    if (filtros.responsavelId === "__none__" && p.responsavelId) return false
    if (
      filtros.responsavelId !== "ALL" &&
      filtros.responsavelId !== "__none__" &&
      p.responsavelId !== filtros.responsavelId
    ) {
      return false
    }
    if (filtros.prazoDe || filtros.prazoAte) {
      const dia = diaIso(p.prazo)
      if (!dia) return false
      if (filtros.prazoDe && dia < filtros.prazoDe) return false
      if (filtros.prazoAte && dia > filtros.prazoAte) return false
    }
    return true
  })
}

export function processosParaCsv(processos: ProcessoApi[]): string {
  const headers = [
    "Número",
    "Título",
    "Status",
    "Prioridade",
    "Prazo",
    "Situação",
    "Cliente",
    "Responsável",
  ]
  const rows = processos.map((c) =>
    [
      csvCell(c.numero),
      csvCell(c.titulo || ""),
      csvCell(c.status),
      csvCell(c.prioridade || ""),
      csvCell(formatDatePt(c.prazo)),
      csvCell(c.concluido ? "Concluído" : "Em andamento"),
      csvCell(c.cliente?.nome || ""),
      csvCell(c.responsavel?.nome || ""),
    ].join(","),
  )
  return [headers.join(","), ...rows].join("\n")
}
