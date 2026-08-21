import { onlyDigits } from "@/lib/masks"

/** Remove pontuação e exige 20 dígitos do número CNJ. */
export function normalizarNumeroCnj(numero: string): string | null {
  const digits = onlyDigits(numero)
  return digits.length === 20 ? digits : null
}

/**
 * Dígito verificador do CNJ (Resolução 65/2008):
 * DD = 98 − (NNNNNNN + AAAA + J + TR + OOOO) mod 97
 */
export function validarDigitoCnj(numero: string): boolean {
  const digits = normalizarNumeroCnj(numero)
  if (!digits) return false
  const sequencial = digits.slice(0, 7)
  const dv = digits.slice(7, 9)
  const resto = digits.slice(9)
  const esperado = String(98n - (BigInt(sequencial + resto) % 97n)).padStart(2, "0")
  return dv === esperado
}
