import { api } from "@/lib/api"

export type ClienteApi = {
  id: string
  nome: string
  cpf: string
  email: string | null
  telefone: string | null
  criadoEm: string
  _count?: { processos: number }
}

export type ClienteFormData = {
  nome: string
  cpf: string
  email?: string
  telefone?: string
}

export type ClienteCard = {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  casesCount: number
}

export function mapClienteToCard(cliente: ClienteApi): ClienteCard {
  return {
    id: cliente.id,
    name: cliente.nome,
    email: cliente.email ?? "",
    phone: cliente.telefone ?? "",
    cpf: cliente.cpf,
    casesCount: cliente._count?.processos ?? 0,
  }
}

export const clientesApi = {
  listar: () => api.get<ClienteApi[]>("/clientes"),
  criar: (dados: ClienteFormData) => api.post<ClienteApi>("/clientes", dados),
  atualizar: (id: string, dados: ClienteFormData) =>
    api.put<ClienteApi>(`/clientes/${id}`, dados),
  remover: (id: string) => api.delete<ClienteApi>(`/clientes/${id}`),
}
