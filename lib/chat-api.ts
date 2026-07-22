import { api } from "@/lib/api"

export type MensagemApi = {
  id: string
  conteudo: string
  isUser: boolean
  criadoEm: string
  conversacaoId: string
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
  listarConversas: () => api.get<ConversacaoApi[]>("/chat/conversas"),
  criarConversa: (dados?: { titulo?: string; processoId?: string }) =>
    api.post<ConversacaoApi>("/chat/conversas", dados ?? {}),
  obterConversa: (id: string) => api.get<ConversacaoApi>(`/chat/conversas/${id}`),
  porProcesso: (processoId: string) =>
    api.get<ConversacaoApi>(`/chat/conversas/processo/${processoId}`),
  enviarMensagem: (conversacaoId: string, conteudo: string) =>
    api.post<{ mensagemUsuario: MensagemApi; mensagemIa: MensagemApi }>(
      `/chat/conversas/${conversacaoId}/mensagens`,
      { conteudo },
    ),
  remover: (id: string) => api.delete<ConversacaoApi>(`/chat/conversas/${id}`),
}
