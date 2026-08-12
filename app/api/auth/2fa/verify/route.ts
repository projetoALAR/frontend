import { NextResponse } from "next/server"
import { getNestApiUrl, setAuthCookie } from "@/lib/auth-session"

async function nestErrorMessage(response: Response): Promise<string> {
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

export async function POST(request: Request) {
  const body = await request.json()
  const response = await fetch(`${getNestApiUrl()}/auth/2fa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    return NextResponse.json(
      { message: await nestErrorMessage(response) },
      { status: response.status },
    )
  }

  const data = (await response.json()) as {
    access_token: string
    user: unknown
  }
  await setAuthCookie(data.access_token)
  return NextResponse.json({ user: data.user })
}
