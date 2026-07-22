import { api } from "@/lib/api"

export type CompromissoApi = {
  id: string
  titulo: string
  descricao: string | null
  dataHora: string
  criadoEm: string
  processoId: string | null
  processo?: { id?: string; numero: string; titulo?: string | null } | null
}

export type CompromissoFormData = {
  titulo: string
  descricao?: string
  dataHora: string
  processoId?: string | null
}

export const compromissosApi = {
  listar: () => api.get<CompromissoApi[]>("/compromissos"),
  criar: (dados: CompromissoFormData) => api.post<CompromissoApi>("/compromissos", dados),
  atualizar: (id: string, dados: Partial<CompromissoFormData>) =>
    api.put<CompromissoApi>(`/compromissos/${id}`, dados),
  remover: (id: string) => api.delete<CompromissoApi>(`/compromissos/${id}`),
}
