const TOKEN_KEY = "alar_token"

export type AuthUser = {
  id: string
  nome: string
  email: string
  fotoUrl: string | null
  criadoEm: string
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

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

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await authErrorMessage(response))
  }

  return response.json() as Promise<T>
}

export type AuthResponse = {
  access_token: string
  user: AuthUser
}

export const authApi = {
  login: (email: string, senha: string) =>
    authRequest<AuthResponse>("/auth/login", { email, senha }),
  register: (nome: string, email: string, senha: string) =>
    authRequest<AuthResponse>("/auth/register", { nome, email, senha }),
  me: async (): Promise<AuthUser> => {
    const token = getAuthToken()
    if (!token) throw new Error("Não autenticado")

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Sessão inválida")
    }

    return response.json() as Promise<AuthUser>
  },
}
