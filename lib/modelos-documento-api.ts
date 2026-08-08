import { api } from "@/lib/api"

export const CATEGORIAS_MODELO = [
  "Petição",
  "Contrato",
  "Procuração",
  "Notificação",
  "Recurso",
  "Outro",
] as const

export type CategoriaModelo = (typeof CATEGORIAS_MODELO)[number]

export const PLACEHOLDERS_DISPONIVEIS = [
  "{{cliente.nome}}",
  "{{cliente.cpf}}",
  "{{cliente.email}}",
  "{{cliente.telefone}}",
  "{{processo.numero}}",
  "{{processo.titulo}}",
  "{{processo.status}}",
  "{{processo.descricao}}",
  "{{data.hoje}}",
] as const

export type ModeloDocumentoApi = {
  id: string
  nome: string
  categoria: string
  conteudo: string
  criadoEm: string
  atualizadoEm: string
}

export type ModeloDocumentoFormData = {
  nome: string
  categoria: string
  conteudo: string
}

export type PreviewModeloApi = {
  modeloId: string
  modeloNome: string
  processoId: string
  texto: string
}

export const modelosDocumentoApi = {
  listar: (categoria?: string) => {
    const qs = categoria ? `?categoria=${encodeURIComponent(categoria)}` : ""
    return api.get<ModeloDocumentoApi[]>(`/modelos-documento${qs}`)
  },
  buscar: (id: string) => api.get<ModeloDocumentoApi>(`/modelos-documento/${id}`),
  criar: (dados: ModeloDocumentoFormData) =>
    api.post<ModeloDocumentoApi>("/modelos-documento", dados),
  atualizar: (id: string, dados: Partial<ModeloDocumentoFormData>) =>
    api.put<ModeloDocumentoApi>(`/modelos-documento/${id}`, dados),
  remover: (id: string) => api.delete<ModeloDocumentoApi>(`/modelos-documento/${id}`),
  preview: (modeloId: string, processoId: string) =>
    api.get<PreviewModeloApi>(
      `/modelos-documento/${modeloId}/preview/${processoId}`,
    ),
}
