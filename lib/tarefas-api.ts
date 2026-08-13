import { api } from "@/lib/api"

export type ProcessoTarefaApi = {
  id: string
  processoId: string
  titulo: string
  concluida: boolean
  ordem: number
  prazo: string | null
  criadoPorId: string | null
  criadoPor?: { id: string; nome: string; email: string } | null
  criadoEm: string
  atualizadoEm: string
}

export type CreateProcessoTarefa = {
  titulo: string
  prazo?: string | null
}

export type UpdateProcessoTarefa = {
  titulo?: string
  concluida?: boolean
  prazo?: string | null
}

export const tarefasApi = {
  listar: (processoId: string) =>
    api.get<ProcessoTarefaApi[]>(`/processos/${processoId}/tarefas`),
  criar: (processoId: string, dados: CreateProcessoTarefa) =>
    api.post<ProcessoTarefaApi>(`/processos/${processoId}/tarefas`, dados),
  atualizar: (processoId: string, tarefaId: string, dados: UpdateProcessoTarefa) =>
    api.put<ProcessoTarefaApi>(`/processos/${processoId}/tarefas/${tarefaId}`, dados),
  remover: (processoId: string, tarefaId: string) =>
    api.delete<ProcessoTarefaApi>(`/processos/${processoId}/tarefas/${tarefaId}`),
}
