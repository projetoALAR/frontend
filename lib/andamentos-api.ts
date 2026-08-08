import { api } from "@/lib/api"

export type AndamentoApi = {
  id: string
  processoId: string
  data: string
  descricao: string
  codigoMovimento: number | null
  /** Explicação amigável do código TPU (quando mapeado no glossário). */
  explicacao?: string | null
  origem: unknown
  criadoEm: string
}

export type ResultadoSyncAndamentos = {
  processoId: string
  inseridos: number
  motivo?: string
}

export const andamentosApi = {
  listarPorProcesso: (processoId: string) =>
    api.get<AndamentoApi[]>(`/processos/${processoId}/andamentos`),
  sincronizar: (processoId: string) =>
    api.post<ResultadoSyncAndamentos>(`/processos/${processoId}/andamentos/sync`),
}
