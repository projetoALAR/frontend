import { api } from "@/lib/api"

export type NotificacoesPrefs = {
  email: boolean
  push: boolean
  reminders: boolean
  teamUpdates: boolean
}

export type PreferenciaApi = {
  id: string
  nome: string
  email: string
  notificacoes: NotificacoesPrefs
  tema: string
  atualizadoEm: string
}

export type PreferenciaFormData = {
  nome?: string
  email?: string
  notificacoes?: NotificacoesPrefs
  tema?: string
}

export const preferenciasApi = {
  obter: () => api.get<PreferenciaApi>("/preferencias"),
  atualizar: (dados: PreferenciaFormData) =>
    api.put<PreferenciaApi>("/preferencias", dados),
}
