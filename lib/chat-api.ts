import { api } from "@/lib/api"

export type ChatFonteApi = {
  documentoId: string
  nome: string
  trecho: string | null
  tipo: "texto" | "pdf" | "imagem" | "outro"
}

export type MensagemApi = {
  id: string
  conteudo: string
  isUser: boolean
  fontes?: ChatFonteApi[] | null
  feedback?: "util" | "nao_util" | null
  tokensUsados?: number | null
  criadoEm: string
  conversacaoId: string
}

export type ChatExportApi = {
  formato: "markdown" | "json"
  titulo: string
  nomeArquivo: string
  conteudo: string
}

export type ChatQuotaApi = {
  usados: number
  limite: number
  restantes: number
}

export type ChatMetricasApi = {
  dia: string
  tokensTotal: number
  mensagensIa: number
  feedbackUtil: number
  feedbackNaoUtil: number
  porUsuario: Array<{
    usuarioId: string
    tokens: number
    mensagens: number
  }>
}

export type ConversacaoApi = {
  id: string
  titulo: string
  processoId: string | null
  criadoEm: string
  atualizadoEm: string
  mensagens?: MensagemApi[]
  _count?: { mensagens: number }
}

export const chatApi = {
  /** Conversas do chat geral (sem vínculo com processo). */
  listarConversas: () => api.get<ConversacaoApi[]>("/chat/conversas"),
  criarConversa: (dados?: { titulo?: string }) =>
    api.post<ConversacaoApi>("/chat/conversas", dados ?? {}),
  obterConversa: (id: string) => api.get<ConversacaoApi>(`/chat/conversas/${id}`),
  /** Chat exclusivo de um caso. */
  porProcesso: (processoId: string) =>
    api.get<ConversacaoApi>(`/chat/conversas/processo/${processoId}`),
  enviarMensagem: (conversacaoId: string, conteudo: string) =>
    api.post<{ mensagemUsuario: MensagemApi; mensagemIa: MensagemApi }>(
      `/chat/conversas/${conversacaoId}/mensagens`,
      { conteudo },
    ),
  obterQuota: () => api.get<ChatQuotaApi>("/chat/quota"),
  registrarFeedback: (mensagemId: string, util: boolean) =>
    api.post<MensagemApi>(`/chat/mensagens/${mensagemId}/feedback`, { util }),
  exportar: (conversacaoId: string, formato: "markdown" | "json" = "markdown") =>
    api.get<ChatExportApi>(
      `/chat/conversas/${conversacaoId}/export?formato=${formato}`,
    ),
  metricas: () => api.get<ChatMetricasApi>("/chat/metricas"),
  remover: (id: string) => api.delete<ConversacaoApi>(`/chat/conversas/${id}`),
}
