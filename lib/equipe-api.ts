import { api } from "@/lib/api"
import type { Role } from "@/lib/auth-api"
import type { PreviewImportacao } from "@/lib/clientes-api"

export type MembroEquipeApi = {
  id: string
  nome: string
  email: string
  cargo: string
  status: string
  criadoEm: string
  usuarioId?: string | null
  usuario?: {
    id: string
    role: Role
    fotoUrl: string | null
  } | null
}

export type MembroFormData = {
  nome: string
  email: string
  cargo: string
  status?: string
  senha?: string
  role?: Role
}

export type ResultadoLinhaImportacaoEquipe = {
  linha: number
  status: "criado" | "duplicado" | "erro"
  nome?: string
  email?: string
  membroId?: string
  motivo?: string
}

export type ResultadoImportacaoEquipe = {
  total: number
  criados: number
  duplicados: number
  erros: number
  resultados: ResultadoLinhaImportacaoEquipe[]
}

export const equipeApi = {
  listar: () => api.get<MembroEquipeApi[]>("/equipe"),
  criar: (dados: MembroFormData) => api.post<MembroEquipeApi>("/equipe", dados),
  atualizar: (id: string, dados: Partial<MembroFormData>) =>
    api.put<MembroEquipeApi>(`/equipe/${id}`, dados),
  remover: (id: string) => api.delete<MembroEquipeApi>(`/equipe/${id}`),
  baixarModeloImportacao: () => api.getBlob("/equipe/importacao/modelo"),
  previewImportacao: (arquivo: File) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    return api.upload<PreviewImportacao>("/equipe/importar/preview", formData)
  },
  importar: (
    arquivo: File,
    mapeamento?: Record<string, string | null>,
    senhaPadrao?: string,
  ) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    if (mapeamento) {
      formData.append("mapeamento", JSON.stringify(mapeamento))
    }
    if (senhaPadrao?.trim()) {
      formData.append("senhaPadrao", senhaPadrao.trim())
    }
    return api.upload<ResultadoImportacaoEquipe>("/equipe/importar", formData)
  },
}
