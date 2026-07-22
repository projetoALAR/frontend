import { api } from "@/lib/api"
import type { ProcessoApi } from "@/lib/processos-api"
import type { CompromissoApi } from "@/lib/compromissos-api"

export type DashboardResumo = {
  totalClientes: number
  totalProcessos: number
  processosConcluidos: number
  processosAtivos: number
  percentualConclusao: number
  totalMembros: number
  processosPorStatus: Array<{ status: string; _count: { status: number } }>
  processosRecentes: ProcessoApi[]
  proximosPrazos: {
    compromissos: CompromissoApi[]
    processos: Array<{
      id: string
      titulo: string | null
      numero: string
      prazo: string | null
      prioridade: string | null
      status: string
    }>
  }
}

export const dashboardApi = {
  resumo: () => api.get<DashboardResumo>("/dashboard/resumo"),
}
