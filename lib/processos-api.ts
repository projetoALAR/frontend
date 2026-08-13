import { api } from "@/lib/api"
import type { components, Role } from "@/lib/openapi"

export type { Role }

export type UsuarioResumo = components["schemas"]["UsuarioResumoDto"]
export type ProcessoApi = components["schemas"]["ProcessoRespostaDto"]
export type ProcessoFormData = components["schemas"]["CreateProcessoDto"]

export const processosApi = {
  listar: () => api.get<ProcessoApi[]>("/processos"),
  obter: (id: string) => api.get<ProcessoApi>(`/processos/${id}`),
  listarPorCliente: (clienteId: string) =>
    api.get<ProcessoApi[]>(`/processos/cliente/${clienteId}`),
  criar: (dados: ProcessoFormData) => api.post<ProcessoApi>("/processos", dados),
  atualizar: (id: string, dados: Partial<ProcessoFormData>) =>
    api.put<ProcessoApi>(`/processos/${id}`, dados),
  remover: (id: string) => api.delete<ProcessoApi>(`/processos/${id}`),
  baixarCapa: (id: string) => api.getBlob(`/processos/${id}/capa`),
}
