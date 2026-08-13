import { NextResponse } from "next/server"
import { clearAuthCookie, getAuthCookie, getNestApiV1Url } from "@/lib/auth-session"

export async function POST() {
  const token = await getAuthCookie()
  if (token) {
    try {
      await fetch(`${getNestApiV1Url()}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // limpa cookie mesmo se a API estiver indisponível
    }
  }

  await clearAuthCookie()
  return NextResponse.json({ ok: true })
}
