import { api } from "@/lib/api"
import type { components, Role as OpenApiRole } from "@/lib/openapi"

export type Role = OpenApiRole

export type AuthUser = components["schemas"]["UsuarioAuthDto"]

export type AuthResponse = {
  user: AuthUser
}

export type LoginResult =
  | AuthResponse
  | { requires2fa: true; preAuthToken: string }

const LEGACY_TOKEN_KEY = "alar_token"

/** Remove token legado do localStorage (migração para cookie httpOnly). */
export function clearLegacyAuthToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

async function authErrorMessage(response: Response): Promise<string> {
  const fallback = `Erro na autenticação (${response.status})`
  try {
    const text = await response.text()
    if (!text) return fallback
    try {
      const json = JSON.parse(text) as { message?: string | string[] }
      if (Array.isArray(json.message)) return json.message.join(", ")
      if (typeof json.message === "string" && json.message.trim()) return json.message
    } catch {
      return text
    }
    return text
  } catch {
    return response.statusText || fallback
  }
}

async function sessionAuthRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await authErrorMessage(response))
  }

  return response.json() as Promise<T>
}

export const authApi = {
  login: (email: string, senha: string) =>
    sessionAuthRequest<LoginResult>("/api/auth/login", { email, senha }),

  verifyTwoFactor: (preAuthToken: string, code: string) =>
    sessionAuthRequest<AuthResponse>("/api/auth/2fa/verify", {
      preAuthToken,
      code,
    }),

  twoFactorStatus: () => api.get<{ enabled: boolean }>("/auth/2fa/status"),

  setupTwoFactor: () =>
    api.post<{ secret: string; otpauthUrl: string; qrDataUrl: string }>(
      "/auth/2fa/setup",
    ),

  enableTwoFactor: (code: string) =>
    api.post<{ ok: boolean; recoveryCodes: string[] }>("/auth/2fa/enable", {
      code,
    }),

  disableTwoFactor: (senha: string, code: string) =>
    api.post<{ ok: boolean }>("/auth/2fa/disable", { senha, code }),

  register: (nome: string, email: string, senha: string) =>
    sessionAuthRequest<AuthResponse>("/api/auth/register", { nome, email, senha }),

  logout: async () => {
    clearLegacyAuthToken()
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    })
  },

  changePassword: (senhaAtual: string, novaSenha: string) =>
    api.post<{ ok: boolean }>("/auth/change-password", { senhaAtual, novaSenha }),

  createUser: (dados: {
    nome: string
    email: string
    senha: string
    role?: Role
  }) => api.post<{ user: AuthUser }>("/auth/usuarios", dados),

  listUsers: () => api.get<AuthUser[]>("/auth/usuarios"),

  me: () => api.get<AuthUser>("/auth/me"),
}
