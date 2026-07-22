import { api } from "@/lib/api"

export type DocumentoApi = {
  id: string
  nome: string
  urlArquivo: string
  tamanho: number | null
  criadoEm: string
  processoId: string
}

export const documentosApi = {
  listarPorProcesso: (processoId: string) =>
    api.get<DocumentoApi[]>(`/documentos/processo/${processoId}`),
  upload: (processoId: string, arquivo: File) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    formData.append("processoId", processoId)
    return api.upload<DocumentoApi>("/documentos/upload", formData)
  },
  remover: (id: string) => api.delete<DocumentoApi>(`/documentos/${id}`),
}
