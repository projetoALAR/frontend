import { NextResponse } from "next/server"
import { getAuthCookie } from "@/lib/auth-session"

/** Checagem leve de presença do cookie (sem validar JWT). */
export async function GET() {
  const token = await getAuthCookie()
  return NextResponse.json({ authenticated: Boolean(token) })
}
