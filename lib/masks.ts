export type MaskKind = "cpf" | "cnpj" | "phone" | "cnj" | "cep" | "processo"

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function maskCpf(value: string): string {
  if (/^ANON/i.test(value.trim())) return value.trim()
  const d = onlyDigits(value).slice(0, 11)
  const p1 = d.slice(0, 3)
  const p2 = d.slice(3, 6)
  const p3 = d.slice(6, 9)
  const p4 = d.slice(9, 11)
  if (d.length === 0) return ""
  if (d.length < 3) return p1
  if (d.length === 3) return `${p1}.`
  if (d.length < 6) return `${p1}.${p2}`
  if (d.length === 6) return `${p1}.${p2}.`
  if (d.length < 9) return `${p1}.${p2}.${p3}`
  if (d.length === 9) return `${p1}.${p2}.${p3}-`
  return `${p1}.${p2}.${p3}-${p4}`
}

/** 00.000.000/0000-00 (14 dígitos). */
export function maskCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14)
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 5)
  const p3 = d.slice(5, 8)
  const p4 = d.slice(8, 12)
  const p5 = d.slice(12, 14)
  if (d.length === 0) return ""
  if (d.length < 2) return p1
  if (d.length === 2) return `${p1}.`
  if (d.length < 5) return `${p1}.${p2}`
  if (d.length === 5) return `${p1}.${p2}.`
  if (d.length < 8) return `${p1}.${p2}.${p3}`
  if (d.length === 8) return `${p1}.${p2}.${p3}/`
  if (d.length < 12) return `${p1}.${p2}.${p3}/${p4}`
  if (d.length === 12) return `${p1}.${p2}.${p3}/${p4}-`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

/** 00000-000. */
export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8)
  if (d.length === 0) return ""
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

/** Celular (11) 99999-9999 ou fixo (11) 9999-9999. */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11)
  if (!d) return ""
  if (d.length === 1) return `(${d}`
  const ddd = d.slice(0, 2)
  const rest = d.slice(2)
  if (d.length === 2) return `(${ddd}) `
  if (d.length < 6) return `(${ddd}) ${rest}`
  if (d.length === 6) return `(${ddd}) ${rest}-`
  if (d.length <= 10) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  }
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`
}

/** NNNNNNN-DD.AAAA.J.TR.OOOO (20 dígitos). */
export function maskCnj(value: string): string {
  const d = onlyDigits(value).slice(0, 20)
  const p1 = d.slice(0, 7)
  const p2 = d.slice(7, 9)
  const p3 = d.slice(9, 13)
  const p4 = d.slice(13, 14)
  const p5 = d.slice(14, 16)
  const p6 = d.slice(16, 20)
  if (d.length === 0) return ""
  if (d.length < 7) return p1
  if (d.length === 7) return `${p1}-`
  if (d.length < 9) return `${p1}-${p2}`
  if (d.length === 9) return `${p1}-${p2}.`
  if (d.length < 13) return `${p1}-${p2}.${p3}`
  if (d.length === 13) return `${p1}-${p2}.${p3}.`
  if (d.length < 14) return `${p1}-${p2}.${p3}.${p4}`
  if (d.length === 14) return `${p1}-${p2}.${p3}.${p4}.`
  if (d.length < 16) return `${p1}-${p2}.${p3}.${p4}.${p5}`
  if (d.length === 16) return `${p1}-${p2}.${p3}.${p4}.${p5}.`
  return `${p1}-${p2}.${p3}.${p4}.${p5}.${p6}`
}

/** CNJ se só houver dígitos; código interno do escritório se houver letra. */
export function maskProcessoNumero(value: string): string {
  if (/[A-Za-z]/.test(value)) return value.slice(0, 80)
  return maskCnj(value)
}

export function applyMask(kind: MaskKind, value: string): string {
  switch (kind) {
    case "cpf":
      return maskCpf(value)
    case "cnpj":
      return maskCnpj(value)
    case "cep":
      return maskCep(value)
    case "phone":
      return maskPhone(value)
    case "cnj":
      return maskCnj(value)
    case "processo":
      return maskProcessoNumero(value)
  }
}

export function formatCpf(value?: string | null): string {
  if (!value) return "—"
  if (/^ANON/i.test(value.trim())) return value
  const d = onlyDigits(value)
  return d.length === 11 ? maskCpf(d) : value
}

export function formatPhone(value?: string | null): string {
  if (!value) return "—"
  const d = onlyDigits(value)
  if (d.length < 10) return value
  return maskPhone(d)
}

export function formatCnpj(value?: string | null): string {
  if (!value) return "—"
  const d = onlyDigits(value)
  return d.length === 14 ? maskCnpj(d) : value
}

export function formatCep(value?: string | null): string {
  if (!value) return "—"
  const d = onlyDigits(value)
  return d.length === 8 ? maskCep(d) : value
}

export function formatDocumentoCliente(opts: {
  tipo?: string | null
  cpf?: string | null
  cnpj?: string | null
}): string {
  if (opts.tipo === "PJ") return formatCnpj(opts.cnpj)
  return formatCpf(opts.cpf)
}

export function formatCnj(value?: string | null): string {
  if (!value) return "—"
  const d = onlyDigits(value)
  return d.length === 20 && !/[A-Za-z]/.test(value) ? maskCnj(d) : value
}

export const MASK_MAX_LENGTH: Record<MaskKind, number> = {
  cpf: 14,
  cnpj: 18,
  cep: 9,
  phone: 15,
  cnj: 25,
  processo: 80,
}
