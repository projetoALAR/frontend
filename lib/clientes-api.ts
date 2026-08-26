import { api } from "@/lib/api"
import type { components } from "@/lib/openapi"
import {
  normalizarListaPaginada,
  type ListaPaginada,
} from "@/lib/lista-paginada"
import { fetchWithListaCache, invalidateListaCache } from "@/lib/lista-cache"

export type { ListaPaginada }

export type ClienteApi = components["schemas"]["ClienteRespostaDto"]
export type ClienteFormData = components["schemas"]["CreateClienteDto"]
export type ClienteTipo = "PF" | "PJ"
export type DadosClienteExtraidos = components["schemas"]["DadosClienteExtraidos"]

export type ClienteCard = {
  id: string
  name: string
  tipo: ClienteTipo
  email: string
  phone: string
  cpf: string
  cnpj: string
  nomeFantasia: string
  rg: string
  endereco: string
  cidade: string
  uf: string
  cep: string
  observacoes: string
  casesCount: number
}

export function mapClienteToCard(cliente: ClienteApi): ClienteCard {
  return {
    id: cliente.id,
    name: cliente.nome,
    tipo: cliente.tipo === "PJ" ? "PJ" : "PF",
    email: cliente.email ?? "",
    phone: cliente.telefone ?? "",
    cpf: cliente.cpf ?? "",
    cnpj: cliente.cnpj ?? "",
    nomeFantasia: cliente.nomeFantasia ?? "",
    rg: cliente.rg ?? "",
    endereco: cliente.endereco ?? "",
    cidade: cliente.cidade ?? "",
    uf: cliente.uf ?? "",
    cep: cliente.cep ?? "",
    observacoes: cliente.observacoes ?? "",
    casesCount: cliente._count?.processos ?? 0,
  }
}

export function isClienteAnonimizado(client: Pick<ClienteCard, "name" | "cpf">) {
  return (
    client.name === "Titular anonimizado" ||
    client.cpf.toUpperCase().startsWith("ANON")
  )
}

export type ListarClientesFiltro = {
  page: number
  limit?: number
  q?: string
}

export const clientesApi = {
  /** Lista completa (modais / selects). */
  listar: () => api.get<ClienteApi[]>("/clientes"),
  /** Lista paginada com busca no servidor. */
  listarPagina: async (filtro: ListarClientesFiltro, opts?: { force?: boolean }) => {
    const limit = filtro.limit ?? 12
    const params = new URLSearchParams()
    params.set("page", String(filtro.page))
    params.set("limit", String(limit))
    if (filtro.q?.trim()) params.set("q", filtro.q.trim())
    const key = `clientes:${params}`
    return fetchWithListaCache(
      key,
      async () => {
        const data = await api.get<unknown>(`/clientes?${params}`)
        return normalizarListaPaginada<ClienteApi>(data, filtro.page, limit)
      },
      { force: opts?.force },
    )
  },
  obter: (id: string) => api.get<ClienteApi>(`/clientes/${id}`),
  criar: async (dados: ClienteFormData) => {
    const created = await api.post<ClienteApi>("/clientes", dados)
    invalidateListaCache("clientes:")
    return created
  },
  atualizar: async (id: string, dados: ClienteFormData) => {
    const updated = await api.put<ClienteApi>(`/clientes/${id}`, dados)
    invalidateListaCache("clientes:")
    return updated
  },
  remover: async (id: string) => {
    const removed = await api.delete<ClienteApi>(`/clientes/${id}`)
    invalidateListaCache("clientes:")
    return removed
  },
  exportar: (id: string) =>
    api.get<{
      exportadoEm: string
      origem: string
      cliente: ClienteApi
      processos: unknown[]
    }>(`/clientes/${id}/export`),
  anonimizar: (id: string) => api.post<ClienteApi>(`/clientes/${id}/anonimizar`),
  extrairDados: (arquivo: File) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    return api.upload<DadosClienteExtraidos>("/clientes/extrair-dados", formData)
  },
  baixarModeloImportacao: () => api.getBlob("/clientes/importacao/modelo"),
  previewImportacao: (arquivo: File) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    return api.upload<PreviewImportacao>("/clientes/importar/preview", formData)
  },
  importarCsv: (arquivo: File, mapeamento?: Record<string, string | null>) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    if (mapeamento) {
      formData.append("mapeamento", JSON.stringify(mapeamento))
    }
    return api.upload<ResultadoImportacaoClientes>("/clientes/importar", formData)
  },
}

export type CampoAlvoImportacao = {
  chave: string
  rotulo: string
  obrigatorio?: boolean
  documentoFlexivel?: boolean
}

export type PreviewImportacao = {
  cabecalhos: string[]
  sugestoes: (string | null)[]
  amostra: string[][]
  totalLinhas: number
  camposAlvo: CampoAlvoImportacao[]
}

export type ResultadoLinhaImportacao = {
  linha: number
  status: "criado" | "duplicado" | "erro"
  nome?: string
  clienteId?: string
  motivo?: string
}

export type ResultadoImportacaoClientes = {
  total: number
  criados: number
  duplicados: number
  erros: number
  resultados: ResultadoLinhaImportacao[]
}
