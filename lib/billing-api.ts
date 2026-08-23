import { api } from "@/lib/api"
import type { PlanoId } from "@/lib/planos"

export type AssinaturaApi = {
  id: string
  planoId: string
  ciclo: string
  status: string
  valor: number | null
  invoiceUrl: string | null
  trialAte: string | null
  vigenteAte: string | null
  atualizadoEm: string
}

export type MinhaAssinaturaResponse = {
  asaasConfigurado: boolean
  temAcesso: boolean
  assinatura: AssinaturaApi | null
}

export type CheckoutResponse = MinhaAssinaturaResponse & {
  modo: "trial_local" | "trial_asaas" | "checkout"
  checkoutUrl: string | null
  mensagem: string
  assinaturaId?: string
}

export const billingApi = {
  minha: () => api.get<MinhaAssinaturaResponse>("/billing/assinatura"),
  checkout: (dados: {
    planoId: PlanoId
    ciclo: "mensal" | "anual"
    cpfCnpj: string
    trial?: boolean
  }) => api.post<CheckoutResponse>("/billing/checkout", dados),
}
