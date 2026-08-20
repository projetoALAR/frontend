import { api } from "@/lib/api"
import type { components, Role } from "@/lib/openapi"
import type { PreviewImportacao } from "@/lib/clientes-api"

export type { Role }
export type { PreviewImportacao }

export type UsuarioResumo = components["schemas"]["UsuarioResumoDto"]
export type ProcessoApi = components["schemas"]["ProcessoRespostaDto"]
export type ProcessoFormData = components["schemas"]["CreateProcessoDto"]

export type ResultadoLinhaImportacaoProcesso = {
  linha: number
  status: "criado" | "duplicado" | "erro"
  numero?: string
  titulo?: string
  processoId?: string
  clienteNome?: string
  motivo?: string
}

export type ResultadoImportacaoProcessos = {
  total: number
  criados: number
  duplicados: number
  erros: number
  resultados: ResultadoLinhaImportacaoProcesso[]
}

export const processosApi = {
  listar: () => api.get<ProcessoApi[]>("/processos"),
  obter: (id: string) => api.get<ProcessoApi>(`/processos/${id}`),
  listarPorCliente: (clienteId: string) =>
    api.get<ProcessoApi[]>(`/processos/cliente/${clienteId}`),
  criar: (dados: ProcessoFormData) => api.post<ProcessoApi>("/processos", dados),
  atualizar: (id: string, dados: Partial<ProcessoFormData>) =>
    api.put<ProcessoApi>(`/processos/${id}`, dados),
  remover: (id: string) => api.delete<ProcessoApi>(`/processos/${id}`),
  baixarCapa: (id: string) => api.getBlob(`/processos/${id}/capa`),
  baixarModeloImportacao: () => api.getBlob("/processos/importacao/modelo"),
  previewImportacao: (arquivo: File) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    return api.upload<PreviewImportacao>("/processos/importar/preview", formData)
  },
  importarCsv: (arquivo: File, mapeamento?: Record<string, string | null>) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    if (mapeamento) {
      formData.append("mapeamento", JSON.stringify(mapeamento))
    }
    return api.upload<ResultadoImportacaoProcessos>("/processos/importar", formData)
  },
}

