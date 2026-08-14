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
  ok: boolean
  inseridos: number
  jaExistentes: number
  totalNaFonte: number
  motivo?: string
  status: string
  mensagem: string
  tribunalSigla: string | null
  tribunalNome: string | null
  em: string
  ultimoMovimento: { data: string; descricao: string } | null
}

export type MovimentoConsulta = {
  data: string
  descricao: string
  codigoMovimento: number | null
  explicacao: string | null
}

export type ResultadoConsultaPublica = {
  ok: boolean
  numero: string | null
  tribunalSigla: string | null
  tribunalNome: string | null
  motivo?: string
  status: string
  movimentos: MovimentoConsulta[]
  caso?: { id: string; titulo: string | null; numero: string } | null
}

export const andamentosApi = {
  listarPorProcesso: (processoId: string) =>
    api.get<AndamentoApi[]>(`/processos/${processoId}/andamentos`),
  criarManual: (processoId: string, dados: CreateAndamentoManual) =>
    api.post<AndamentoApi>(`/processos/${processoId}/andamentos`, dados),
  sincronizar: (processoId: string) =>
    api.post<ResultadoSyncAndamentos>(`/processos/${processoId}/andamentos/sync`),
  consultar: (numero: string) =>
    api.get<ResultadoConsultaPublica>(
      `/consulta-processual?numero=${encodeURIComponent(numero)}`,
    ),
  remover: (processoId: string, andamentoId: string) =>
    api.delete<AndamentoApi>(`/processos/${processoId}/andamentos/${andamentoId}`),
}
