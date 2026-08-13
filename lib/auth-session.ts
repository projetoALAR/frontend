import { cookies } from "next/headers"

export const AUTH_COOKIE = "alar_token"

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7d (alinha com JWT padrão)

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  }
}

export async function setAuthCookie(token: string) {
  const store = await cookies()
  store.set(AUTH_COOKIE, token, authCookieOptions())
}

export async function clearAuthCookie() {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
}

export async function getAuthCookie(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(AUTH_COOKIE)?.value
}

/** URL absoluta da API Nest (só no servidor). Sem versão — health, docs, etc. */
export function getNestApiUrl() {
  return (
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:3001"
  )
}

/** Base das rotas de negócio: `{API}/v1`. */
export function getNestApiV1Url() {
  return `${getNestApiUrl()}/v1`
}
