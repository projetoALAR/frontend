import { api } from "@/lib/api"

export type InboxItemApi = {
  id: string
  usuarioId: string
  titulo: string
  corpo: string
  tipo: string
  lida: boolean
  link?: string | null
  criadoEm: string
}

export type ContatoFormData = {
  alvoTipo: string
  alvoId: string
  alvoNome: string
  canal: "email" | "telefone"
  observacao?: string
  destino?: string
}

export const inboxApi = {
  listar: (apenasNaoLidas = false) =>
    api.get<InboxItemApi[]>(`/inbox${apenasNaoLidas ? "?apenasNaoLidas=true" : ""}`),
  marcarLida: (id: string) => api.put<{ count: number }>(`/inbox/${id}/lida`, {}),
  marcarTodas: () => api.post<{ count: number }>("/inbox/marcar-todas-lidas", {}),
  registrarContato: (dados: ContatoFormData) => api.post("/contatos", dados),
  listarContatos: () => api.get("/contatos"),
}
