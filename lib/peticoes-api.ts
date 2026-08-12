import { api } from "@/lib/api"
import type { DocumentoApi } from "@/lib/documentos-api"

export type GerarRascunhoPayload = {
  modeloId: string
  processoId: string
}

export type SalvarRascunhoPayload = {
  processoId: string
  nomeArquivo: string
  texto: string
  revisaoConfirmada: true
}

export const peticoesApi = {
  gerar: (dados: GerarRascunhoPayload) =>
    api.post<{ texto: string }>("/peticoes/gerar", dados),
  salvar: (dados: SalvarRascunhoPayload) =>
    api.post<DocumentoApi>("/peticoes/salvar", dados),
}
