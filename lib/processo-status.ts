/** Status canônicos de processo/caso no Alar. */
export const PROCESSO_STATUS_OPTIONS = [
  "Em andamento",
  "Aguardando",
  "Em análise",
  "Audiência marcada",
  "Suspenso",
  "Concluído",
  "Arquivado",
] as const

export type ProcessoStatus = (typeof PROCESSO_STATUS_OPTIONS)[number]

export const PROCESSO_STATUS_DEFAULT: ProcessoStatus = "Em andamento"

/** Status que marcam o caso como concluído. */
export const PROCESSO_STATUS_CONCLUIDOS: readonly string[] = ["Concluído", "Arquivado"]

export function isProcessoStatusConcluido(status: string): boolean {
  return PROCESSO_STATUS_CONCLUIDOS.includes(status)
}

/** Garante lista de opções incluindo status legado fora do catálogo. */
export function processoStatusOptionsFor(current?: string | null): string[] {
  const options = [...PROCESSO_STATUS_OPTIONS]
  const value = current?.trim()
  if (value && !options.includes(value as ProcessoStatus)) {
    return [value, ...options]
  }
  return options
}
