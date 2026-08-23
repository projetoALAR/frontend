import { api } from "@/lib/api"
import type { components } from "@/lib/openapi"

export type DocumentoApi = components["schemas"]["DocumentoRespostaDto"]

export const documentosApi = {
  obter: (id: string) => api.get<DocumentoApi>(`/documentos/${id}`),
  /** Abre via proxy autenticado (mesmo origin) — fallback quando URL assinada falha. */
  urlDownload: (id: string) => `/api/backend/v1/documentos/${id}/download`,
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

/**
 * Abre documento em nova aba.
 * Abre a aba de forma síncrona (anti popup-blocker), depois navega para URL assinada ou proxy.
 */
export async function abrirDocumentoEmNovaAba(documentoId: string) {
  const aba = window.open("about:blank", "_blank")
  if (!aba) {
    throw new Error("O navegador bloqueou a nova aba. Permita pop-ups para este site.")
  }

  const irPara = (url: string) => {
    try {
      aba.location.href = url
    } catch {
      aba.close()
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  try {
    const doc = await documentosApi.obter(documentoId)
    if (doc.urlArquivo?.startsWith("http")) {
      irPara(doc.urlArquivo)
      return
    }
  } catch {
    // cai no proxy autenticado
  }

  irPara(documentosApi.urlDownload(documentoId))
}
