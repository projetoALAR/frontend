import { api } from "@/lib/api"

export type Role = "ADMIN" | "ADVOGADO" | "ASSISTENTE"

export type AuthUser = {
  id: string
  nome: string
  email: string
  role: Role
  fotoUrl: string | null
  criadoEm: string
}

export type AuthResponse = {
  user: AuthUser
}

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
    sessionAuthRequest<AuthResponse>("/api/auth/login", { email, senha }),

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
