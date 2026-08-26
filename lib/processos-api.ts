import { api } from "@/lib/api"
import type { components, Role } from "@/lib/openapi"
import type { PreviewImportacao } from "@/lib/clientes-api"
import {
  normalizarListaPaginada,
  type ListaPaginada,
} from "@/lib/lista-paginada"
import { fetchWithListaCache, invalidateListaCache } from "@/lib/lista-cache"

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

export type ListaPaginadaProcessos = ListaPaginada<ProcessoApi>

export type ListarProcessosFiltro = {
  page: number
  limit?: number
  q?: string
  situacao?: "ativos" | "concluidos"
  status?: string[]
  prioridade?: string[]
  prazoDe?: string
  prazoAte?: string
}

export const processosApi = {
  /** Lista completa (relatórios). */
  listar: () => api.get<ProcessoApi[]>("/processos"),
  /** Lista paginada com busca/filtros no servidor. */
  listarPagina: async (filtro: ListarProcessosFiltro, opts?: { force?: boolean }) => {
    const limit = filtro.limit ?? 12
    const params = new URLSearchParams()
    params.set("page", String(filtro.page))
    params.set("limit", String(limit))
    if (filtro.q?.trim()) params.set("q", filtro.q.trim())
    if (filtro.situacao) params.set("situacao", filtro.situacao)
    if (filtro.status?.length) params.set("status", filtro.status.join(","))
    if (filtro.prioridade?.length) {
      params.set("prioridade", filtro.prioridade.join(","))
    }
    if (filtro.prazoDe) params.set("prazoDe", filtro.prazoDe)
    if (filtro.prazoAte) params.set("prazoAte", filtro.prazoAte)
    const key = `processos:${params}`
    return fetchWithListaCache(
      key,
      async () => {
        const data = await api.get<unknown>(`/processos?${params}`)
        return normalizarListaPaginada<ProcessoApi>(data, filtro.page, limit)
      },
      { force: opts?.force },
    )
  },
  obter: (id: string) => api.get<ProcessoApi>(`/processos/${id}`),
  listarPorCliente: (clienteId: string) =>
    api.get<ProcessoApi[]>(`/processos/cliente/${clienteId}`),
  criar: async (dados: ProcessoFormData) => {
    const created = await api.post<ProcessoApi>("/processos", dados)
    invalidateListaCache("processos:")
    return created
  },
  atualizar: async (id: string, dados: Partial<ProcessoFormData>) => {
    const updated = await api.put<ProcessoApi>(`/processos/${id}`, dados)
    invalidateListaCache("processos:")
    return updated
  },
  remover: async (id: string) => {
    const removed = await api.delete<ProcessoApi>(`/processos/${id}`)
    invalidateListaCache("processos:")
    return removed
  },
  baixarCapa: (id: string) => api.getBlob(`/processos/${id}/capa`),
  baixarRelatorioPdf: (payload: {
    filtrosResumo?: string
    linhas: Array<{
      numero: string
      titulo?: string
      status: string
      prioridade?: string
      prazo?: string
      situacao?: string
      cliente?: string
      responsavel?: string
    }>
  }) => api.postBlob("/processos/relatorio/pdf", payload),
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

