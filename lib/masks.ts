export type MaskKind = "cpf" | "phone" | "cnj" | "processo"

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

export function formatCnj(value?: string | null): string {
  if (!value) return "—"
  const d = onlyDigits(value)
  return d.length === 20 && !/[A-Za-z]/.test(value) ? maskCnj(d) : value
}

export const MASK_MAX_LENGTH: Record<MaskKind, number> = {
  cpf: 14,
  phone: 15,
  cnj: 25,
  processo: 80,
}
