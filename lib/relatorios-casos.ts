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

export type ContagemRotulo = { rotulo: string; total: number }

export type PresetPrazo =
  | "hoje"
  | "7d"
  | "30d"
  | "mes"
  | "vencidos"
  | "limpar"

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

function hojeIsoLocal(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function addDiasIso(baseIso: string, dias: number): string {
  const [y, m, day] = baseIso.split("-").map(Number)
  const d = new Date(y, m - 1, day)
  d.setDate(d.getDate() + dias)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Aplica atalho de prazo mantendo os demais filtros. */
export function aplicarPresetPrazo(
  filtros: RelatorioFiltros,
  preset: PresetPrazo,
): RelatorioFiltros {
  const hoje = hojeIsoLocal()
  if (preset === "limpar") {
    return { ...filtros, prazoDe: "", prazoAte: "" }
  }
  if (preset === "hoje") {
    return { ...filtros, prazoDe: hoje, prazoAte: hoje }
  }
  if (preset === "7d") {
    return { ...filtros, prazoDe: hoje, prazoAte: addDiasIso(hoje, 7) }
  }
  if (preset === "30d") {
    return { ...filtros, prazoDe: hoje, prazoAte: addDiasIso(hoje, 30) }
  }
  if (preset === "mes") {
    const [y, m] = hoje.split("-").map(Number)
    const pad = (n: number) => String(n).padStart(2, "0")
    const inicio = `${y}-${pad(m)}-01`
    const fimDate = new Date(y, m, 0)
    const fim = `${fimDate.getFullYear()}-${pad(fimDate.getMonth() + 1)}-${pad(fimDate.getDate())}`
    return { ...filtros, prazoDe: inicio, prazoAte: fim }
  }
  // vencidos: até ontem
  return { ...filtros, prazoDe: "", prazoAte: addDiasIso(hoje, -1) }
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

export function contarSemPrazo(processos: ProcessoApi[]): number {
  return processos.filter((p) => !diaIso(p.prazo)).length
}

export function contarPorStatus(processos: ProcessoApi[]): ContagemRotulo[] {
  const map = new Map<string, number>()
  for (const p of processos) {
    const k = p.status || "—"
    map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()]
    .map(([rotulo, total]) => ({ rotulo, total }))
    .sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, "pt-BR"))
}

export function contarPorResponsavel(processos: ProcessoApi[]): ContagemRotulo[] {
  const map = new Map<string, number>()
  for (const p of processos) {
    const k = p.responsavel?.nome?.trim() || "Sem responsável"
    map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()]
    .map(([rotulo, total]) => ({ rotulo, total }))
    .sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, "pt-BR"))
}

export function resumoFiltrosTexto(
  filtros: RelatorioFiltros,
  opcoes?: { nomeResponsavel?: string },
): string {
  const partes: string[] = []
  if (filtros.busca.trim()) partes.push(`busca="${filtros.busca.trim()}"`)
  if (filtros.status !== "ALL") partes.push(`status=${filtros.status}`)
  if (filtros.prioridade !== "ALL") partes.push(`prioridade=${filtros.prioridade}`)
  if (filtros.situacao === "ativos") partes.push("situacao=em andamento")
  if (filtros.situacao === "concluidos") partes.push("situacao=concluidos")
  if (filtros.responsavelId === "__none__") partes.push("responsavel=sem")
  else if (filtros.responsavelId !== "ALL") {
    partes.push(
      opcoes?.nomeResponsavel
        ? `responsavel=${opcoes.nomeResponsavel}`
        : `responsavelId=${filtros.responsavelId}`,
    )
  }
  if (filtros.prazoDe) partes.push(`prazoDe=${filtros.prazoDe}`)
  if (filtros.prazoAte) partes.push(`prazoAte=${filtros.prazoAte}`)
  return partes.length ? partes.join("; ") : "sem filtros (todos os casos)"
}

export type LinhaRelatorioPdf = {
  numero: string
  titulo: string
  status: string
  prioridade: string
  prazo: string
  situacao: string
  cliente: string
  responsavel: string
}

export function processosParaLinhasPdf(
  processos: ProcessoApi[],
): LinhaRelatorioPdf[] {
  return processos.map((c) => ({
    numero: c.numero,
    titulo: c.titulo || "",
    status: c.status,
    prioridade: c.prioridade || "",
    prazo: formatDatePt(c.prazo),
    situacao: c.concluido ? "Concluído" : "Em andamento",
    cliente: c.cliente?.nome || "",
    responsavel: c.responsavel?.nome || "",
  }))
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
