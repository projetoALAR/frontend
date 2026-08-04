const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const TOKEN_KEY = "alar_token"

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function handleUnauthorized() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login"
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error("Não autenticado")
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new Error(message || `Erro na API (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error("Não autenticado")
  }

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new Error(message || `Erro no upload (${response.status})`)
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => uploadFormData<T>(path, formData),
}

export { API_URL }
