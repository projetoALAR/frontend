export const PASSWORD_MIN_LENGTH = 10

export const PASSWORD_POLICY_HINT =
  "Mínimo 10 caracteres, com maiúscula, minúscula e número."

const COMUNS = new Set([
  "password123",
  "senha12345",
  "senha1234",
  "1234567890",
  "admin12345",
  "qwerty1234",
  "alar123456",
])

export type SenhaCheck = { id: string; ok: boolean; label: string }

export function checarSenha(senha: string): SenhaCheck[] {
  const value = senha ?? ""
  return [
    {
      id: "len",
      ok: value.length >= PASSWORD_MIN_LENGTH,
      label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
    },
    { id: "lower", ok: /[a-z]/.test(value), label: "Uma letra minúscula" },
    { id: "upper", ok: /[A-Z]/.test(value), label: "Uma letra maiúscula" },
    { id: "digit", ok: /\d/.test(value), label: "Um número" },
    {
      id: "comum",
      ok: !COMUNS.has(value.toLowerCase()),
      label: "Não ser uma senha óbvia",
    },
  ]
}

export function senhaAtendePolitica(senha: string): boolean {
  return checarSenha(senha).every((c) => c.ok)
}
