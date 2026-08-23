/** Planos comerciais do Alar (vitrine). Cobrança via Asaas. */

export type PlanoId = "essencial" | "profissional" | "escritorio"

export type Plano = {
  id: PlanoId
  nome: string
  descricao: string
  precoMensal: number
  precoAnual: number
  destaque?: boolean
  cta: string
  limites: string[]
  recursos: string[]
}

export const PLANOS: Plano[] = [
  {
    id: "essencial",
    nome: "Essencial",
    descricao: "Para advogado solo ou início de operação digital.",
    precoMensal: 197,
    precoAnual: 1970,
    cta: "Começar no Essencial",
    limites: ["Até 3 usuários", "10 GB de documentos", "50 mil tokens de IA / dia"],
    recursos: [
      "Clientes e casos ilimitados*",
      "Agenda e prazos",
      "Documentos com URL segura",
      "Chat IA no caso (com citação)",
      "Importação CSV/Excel",
    ],
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "O plano do escritório em crescimento — melhor custo-benefício.",
    precoMensal: 397,
    precoAnual: 3970,
    destaque: true,
    cta: "Escolher Profissional",
    limites: ["Até 12 usuários", "50 GB de documentos", "200 mil tokens de IA / dia"],
    recursos: [
      "Tudo do Essencial",
      "Modelos + gerar documento com IA",
      "Relatórios PDF/CSV",
      "Equipe, auditoria e 2FA",
      "Suporte prioritário por e-mail",
    ],
  },
  {
    id: "escritorio",
    nome: "Escritório",
    descricao: "Operação completa, quotas altas e onboarding assistido.",
    precoMensal: 897,
    precoAnual: 8970,
    cta: "Falar com vendas",
    limites: [
      "A partir de 13 usuários",
      "200 GB de documentos",
      "Quota de IA sob medida",
    ],
    recursos: [
      "Tudo do Profissional",
      "Onboarding e treinamento da equipe",
      "SLA e canal direto",
      "Ambiente dedicado (roadmap)",
      "Condições sob consulta",
    ],
  },
]

export function formatarPrecoBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

/** Gate comercial: só ativo se NEXT_PUBLIC_REQUIRE_SUBSCRIPTION=true|1 */
export function billingEnforceAtivo() {
  const v = process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION
  return v === "true" || v === "1"
}

const STORAGE_PREFIX = "alar-assinatura-v1:"

export type AssinaturaLocal = {
  planoId: PlanoId
  status: "trial" | "ativa" | "pending" | "past_due" | "cancelada"
  ate: string // ISO date
  temAcesso?: boolean
  invoiceUrl?: string | null
}

export function lerAssinaturaLocal(userId: string): AssinaturaLocal | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AssinaturaLocal
    if (parsed.temAcesso === false) return null
    // Status ativa sem data = acesso contínuo (até o próximo sync da API)
    if (parsed.status === "ativa" && (!parsed.ate || parsed.ate === "∞")) {
      return parsed
    }
    if (!parsed?.ate || new Date(parsed.ate).getTime() < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

export function gravarAssinaturaLocal(userId: string, data: AssinaturaLocal) {
  window.localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(data))
}

export function limparAssinaturaLocal(userId: string) {
  window.localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
}

/** Sincroniza cache local a partir da API de billing (Asaas). */
export function sincronizarAssinaturaLocal(
  userId: string,
  data: {
    temAcesso: boolean
    assinatura: {
      planoId: string
      status: string
      trialAte: string | null
      vigenteAte: string | null
      invoiceUrl?: string | null
    } | null
  },
) {
  // Mantém trial/local se a API só devolve pending sem acesso (ex.: checkout pago em andamento)
  if (!data.temAcesso) {
    const atual = lerAssinaturaLocal(userId)
    if (
      atual &&
      (atual.status === "trial" || atual.status === "ativa") &&
      data.assinatura?.status === "pending"
    ) {
      const merged: AssinaturaLocal = {
        ...atual,
        invoiceUrl: data.assinatura.invoiceUrl ?? atual.invoiceUrl ?? null,
      }
      gravarAssinaturaLocal(userId, merged)
      return merged
    }
    limparAssinaturaLocal(userId)
    return null
  }
  if (!data.assinatura) {
    limparAssinaturaLocal(userId)
    return null
  }
  const ate =
    data.assinatura.vigenteAte ||
    data.assinatura.trialAte ||
    (data.assinatura.status === "ativa" ? "∞" : new Date(Date.now() + 14 * 86400000).toISOString())
  const payload: AssinaturaLocal = {
    planoId: data.assinatura.planoId as PlanoId,
    status: data.assinatura.status as AssinaturaLocal["status"],
    ate,
    temAcesso: true,
    invoiceUrl: data.assinatura.invoiceUrl ?? null,
  }
  gravarAssinaturaLocal(userId, payload)
  return payload
}

export function usuarioTemAcessoAssinatura(userId: string | undefined | null) {
  if (!billingEnforceAtivo()) return true
  if (!userId) return false
  return lerAssinaturaLocal(userId) != null
}
