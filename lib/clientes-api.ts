import { api } from "@/lib/api"
import type { components } from "@/lib/openapi"

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

export const clientesApi = {
  listar: () => api.get<ClienteApi[]>("/clientes"),
  obter: (id: string) => api.get<ClienteApi>(`/clientes/${id}`),
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
  extrairDados: (arquivo: File) => {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    return api.upload<DadosClienteExtraidos>("/clientes/extrair-dados", formData)
  },
}
