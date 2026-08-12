import { api } from "@/lib/api"
import type { Role } from "@/lib/auth-api"

export type UsuarioResumo = {
  id: string
  nome: string
  email: string
  role: Role
}

export type ProcessoApi = {
  id: string
  numero: string
  status: string
  descricao: string | null
  titulo: string | null
  prioridade: string | null
  prazo: string | null
  tags: string[] | null
  concluido: boolean
  clienteId: string
  responsavelId: string | null
  coResponsavelId: string | null
  responsavel?: UsuarioResumo | null
  coResponsavel?: UsuarioResumo | null
  criadoEm: string
  atualizadoEm: string
  cliente?: {
    id: string
    nome: string
    email?: string | null
    telefone?: string | null
    cpf?: string
  }
  _count?: { documentos: number; compromissos: number }
}

export type ProcessoFormData = {
  numero: string
  status: string
  clienteId: string
  titulo?: string
  descricao?: string | null
  prioridade?: string
  prazo?: string | null
  tags?: string[]
  concluido?: boolean
  responsavelId?: string | null
  coResponsavelId?: string | null
}

export const processosApi = {
  listar: () => api.get<ProcessoApi[]>("/processos"),
  listarPorCliente: (clienteId: string) =>
    api.get<ProcessoApi[]>(`/processos/cliente/${clienteId}`),
  criar: (dados: ProcessoFormData) => api.post<ProcessoApi>("/processos", dados),
  atualizar: (id: string, dados: Partial<ProcessoFormData>) =>
    api.put<ProcessoApi>(`/processos/${id}`, dados),
  remover: (id: string) => api.delete<ProcessoApi>(`/processos/${id}`),
}
