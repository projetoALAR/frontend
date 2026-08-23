/** Rotas públicas (sem sessão) — manter alinhado entre proxy e AuthGuard. */
export const PUBLIC_AUTH_PATHS = [
  "/login",
  "/sentry-test",
  "/esqueci-senha",
  "/redefinir-senha",
] as const

/** Visíveis sem login e também com login (marketing). */
export const MARKETING_PATHS = ["/planos"] as const

export const FORCE_PASSWORD_PATH = "/trocar-senha"

export function pathMatches(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
