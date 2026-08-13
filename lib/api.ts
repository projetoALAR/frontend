type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

/** Proxy same-origin → Nest `/v1`, com cookie httpOnly → Authorization. */
const API_BASE = "/api/backend/v1"

function handleUnauthorized() {
  if (typeof window === "undefined") return
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login"
  }
}

async function parseError(response: Response): Promise<string> {
  const fallback = `Erro na API (${response.status})`
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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error("Não autenticado")
  }

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null
  const star = /filename\*=(?:UTF-8''|)([^;]+)/i.exec(header)
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].replace(/"/g, "").trim())
    } catch {
      return star[1].replace(/"/g, "").trim()
    }
  }
  const quoted = /filename="([^"]+)"/i.exec(header)
  if (quoted?.[1]) return quoted[1]
  const plain = /filename=([^;]+)/i.exec(header)
  return plain?.[1]?.trim() ?? null
}

async function getBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "same-origin",
  })

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error("Não autenticado")
  }

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return {
    blob: await response.blob(),
    filename: filenameFromDisposition(response.headers.get("content-disposition")),
  }
}

async function uploadFormData<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  })

  if (response.status === 401) {
    handleUnauthorized()
    throw new Error("Não autenticado")
  }

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ?? {} }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => uploadFormData<T>(path, formData),
  getBlob,
}

/** @deprecated Preferir rotas same-origin; mantido para help/config. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
