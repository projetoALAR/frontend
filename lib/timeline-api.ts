import { api } from "@/lib/api"

export const TIMELINE_TIPOS = [
  "CASO_CRIADO",
  "DOCUMENTO",
  "COMPROMISSO",
  "ANDAMENTO",
  "AUDITORIA",
  "COMENTARIO",
] as const

export type TimelineTipo = (typeof TIMELINE_TIPOS)[number]

export type TimelineAutor = {
  nome: string
  email?: string | null
}

export type TimelineEvento = {
  id: string
  tipo: TimelineTipo
  titulo: string
  descricao: string | null
  data: string
  autor: TimelineAutor | null
}

export type TimelineResposta = {
  eventos: TimelineEvento[]
}

export type ProcessoComentarioApi = {
  id: string
  texto: string
  criadoEm: string
  usuario: { nome: string; email: string }
}

export const timelineApi = {
  listar: (processoId: string) =>
    api.get<TimelineResposta>(`/processos/${processoId}/timeline`),
  comentar: (processoId: string, texto: string) =>
    api.post<ProcessoComentarioApi>(`/processos/${processoId}/comentarios`, {
      texto,
    }),
}
