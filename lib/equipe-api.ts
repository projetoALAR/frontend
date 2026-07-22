import { api } from "@/lib/api"

export type MembroEquipeApi = {
  id: string
  nome: string
  email: string
  cargo: string
  status: string
  criadoEm: string
}

export type MembroFormData = {
  nome: string
  email: string
  cargo: string
  status?: string
}

export const equipeApi = {
  listar: () => api.get<MembroEquipeApi[]>("/equipe"),
  criar: (dados: MembroFormData) => api.post<MembroEquipeApi>("/equipe", dados),
  atualizar: (id: string, dados: Partial<MembroFormData>) =>
    api.put<MembroEquipeApi>(`/equipe/${id}`, dados),
  remover: (id: string) => api.delete<MembroEquipeApi>(`/equipe/${id}`),
}
