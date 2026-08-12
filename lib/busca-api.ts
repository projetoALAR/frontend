import { api } from "@/lib/api"

export const BUSCA_TIPOS = ["CLIENTE", "PROCESSO"] as const

export type BuscaTipo = (typeof BUSCA_TIPOS)[number]

export type BuscaResultadoItem = {
  id: string
  tipo: BuscaTipo
  titulo: string
  subtitulo: string | null
  href: string
}

export type BuscaResposta = {
  resultados: BuscaResultadoItem[]
}

export const buscaApi = {
  buscar: (q: string, limit = 20) =>
    api.get<BuscaResposta>(`/busca?q=${encodeURIComponent(q)}&limit=${limit}`),
}
