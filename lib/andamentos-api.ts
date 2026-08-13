import { api } from "@/lib/api"

export type AndamentoApi = {
  id: string
  processoId: string
  data: string
  descricao: string
  codigoMovimento: number | null
  /** Explicação amigável do código TPU (quando mapeado no glossário). */
  explicacao?: string | null
  /** Lançado pela equipe, não veio do tribunal. */
  manual?: boolean
  origem: unknown
  criadoEm: string
}

export type CreateAndamentoManual = {
  descricao: string
  data?: string
}

export type ResultadoSyncAndamentos = {
  processoId: string
  inseridos: number
  motivo?: string
}

export const andamentosApi = {
  listarPorProcesso: (processoId: string) =>
    api.get<AndamentoApi[]>(`/processos/${processoId}/andamentos`),
  criarManual: (processoId: string, dados: CreateAndamentoManual) =>
    api.post<AndamentoApi>(`/processos/${processoId}/andamentos`, dados),
  sincronizar: (processoId: string) =>
    api.post<ResultadoSyncAndamentos>(`/processos/${processoId}/andamentos/sync`),
  remover: (processoId: string, andamentoId: string) =>
    api.delete<AndamentoApi>(`/processos/${processoId}/andamentos/${andamentoId}`),
}
