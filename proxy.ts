import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE } from "@/lib/auth-session"
import { MARKETING_PATHS, PUBLIC_AUTH_PATHS, pathMatches } from "@/lib/public-paths"

/**
 * Proxy (Next.js 16): checagem otimista de sessão.
 * A validação real do JWT continua na API Nest.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value)
  const isPublic =
    pathMatches(pathname, PUBLIC_AUTH_PATHS) ||
    pathMatches(pathname, MARKETING_PATHS)

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (
    hasSession &&
    (pathname === "/login" ||
      pathname === "/esqueci-senha" ||
      pathname.startsWith("/esqueci-senha/"))
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Ignora assets estáticos, APIs internas e arquivos com extensão.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
