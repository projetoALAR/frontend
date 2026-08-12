import { api } from "@/lib/api"

export type AuditAcao = "CRIAR" | "EDITAR" | "EXCLUIR"
export type AuditEntidade = "CLIENTE" | "PROCESSO" | "DOCUMENTO" | "USUARIO"

export type AuditLogApi = {
  id: string
  acao: AuditAcao
  entidade: AuditEntidade
  entidadeId: string
  resumo: string
  usuarioId: string | null
  usuarioNome: string | null
  usuarioEmail: string | null
  criadoEm: string
}

export type AuditListResponse = {
  items: AuditLogApi[]
  total: number
  page: number
  limit: number
}

export type AuditListFiltro = {
  entidade?: AuditEntidade | ""
  acao?: AuditAcao | ""
  de?: string
  ate?: string
  page?: number
  limit?: number
}

export const AUDIT_ACAO_LABEL: Record<AuditAcao, string> = {
  CRIAR: "Criou",
  EDITAR: "Editou",
  EXCLUIR: "Excluiu",
}

export const AUDIT_ENTIDADE_LABEL: Record<AuditEntidade, string> = {
  CLIENTE: "Cliente",
  PROCESSO: "Caso",
  DOCUMENTO: "Documento",
  USUARIO: "Usuário",
}

export const auditoriaApi = {
  listar: (filtro: AuditListFiltro = {}) => {
    const params = new URLSearchParams()
    if (filtro.entidade) params.set("entidade", filtro.entidade)
    if (filtro.acao) params.set("acao", filtro.acao)
    if (filtro.de) params.set("de", filtro.de)
    if (filtro.ate) params.set("ate", filtro.ate)
    if (filtro.page) params.set("page", String(filtro.page))
    if (filtro.limit) params.set("limit", String(filtro.limit))
    const qs = params.toString()
    return api.get<AuditListResponse>(`/auditoria${qs ? `?${qs}` : ""}`)
  },
}
