import { NextResponse } from "next/server"
import { getNestApiV1Url, setAuthCookie } from "@/lib/auth-session"

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
  const response = await fetch(`${getNestApiV1Url()}/auth/login`, {
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
    requires2fa?: boolean
    preAuthToken?: string
    access_token?: string
    user?: unknown
  }

  if (data.requires2fa && data.preAuthToken) {
    return NextResponse.json({
      requires2fa: true,
      preAuthToken: data.preAuthToken,
    })
  }

  if (!data.access_token) {
    return NextResponse.json(
      { message: "Resposta de login inválida" },
      { status: 502 },
    )
  }

  await setAuthCookie(data.access_token)
  return NextResponse.json({ user: data.user })
}
