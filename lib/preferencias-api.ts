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
  fotoUrl?: string | null
  notificacoes: NotificacoesPrefs
  notificacoesLidas: string[]
  tema: string
  atualizadoEm: string
}

export type PreferenciaFormData = {
  nome?: string
  email?: string
  fotoUrl?: string | null
  notificacoes?: NotificacoesPrefs
  notificacoesLidas?: string[]
  tema?: string
}

export const preferenciasApi = {
  obter: () => api.get<PreferenciaApi>("/preferencias"),
  atualizar: (dados: PreferenciaFormData) =>
    api.put<PreferenciaApi>("/preferencias", dados),
  atualizarFoto: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.upload<PreferenciaApi>("/preferencias/foto", formData)
  },
}
