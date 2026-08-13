import { api } from "@/lib/api"
import type { components } from "@/lib/openapi"

export type ClienteApi = components["schemas"]["ClienteRespostaDto"]
export type ClienteFormData = components["schemas"]["CreateClienteDto"]

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

export function isClienteAnonimizado(client: Pick<ClienteCard, "name" | "cpf">) {
  return (
    client.name === "Titular anonimizado" ||
    client.cpf.toUpperCase().startsWith("ANON")
  )
}

export const clientesApi = {
  listar: () => api.get<ClienteApi[]>("/clientes"),
  criar: (dados: ClienteFormData) => api.post<ClienteApi>("/clientes", dados),
  atualizar: (id: string, dados: ClienteFormData) =>
    api.put<ClienteApi>(`/clientes/${id}`, dados),
  remover: (id: string) => api.delete<ClienteApi>(`/clientes/${id}`),
  exportar: (id: string) =>
    api.get<{
      exportadoEm: string
      origem: string
      cliente: ClienteApi
      processos: unknown[]
    }>(`/clientes/${id}/export`),
  anonimizar: (id: string) => api.post<ClienteApi>(`/clientes/${id}/anonimizar`),
}
