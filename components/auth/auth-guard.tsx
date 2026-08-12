"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessPath } from "@/lib/roles"

const PUBLIC_PATHS = ["/login", "/sentry-test"]

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const forbidden = Boolean(user && !isPublic && !canAccessPath(pathname, user.role))

  useEffect(() => {
    if (loading) return

    if (!user && !isPublic) {
      router.replace("/login")
      return
    }

    if (user && pathname === "/login") {
      router.replace("/")
      return
    }

    if (user && !isPublic && !canAccessPath(pathname, user.role)) {
      router.replace("/")
    }
  }, [user, loading, isPublic, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando sessão...</p>
      </div>
    )
  }

  if (!user && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
      </div>
    )
  }

  if (user && pathname === "/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Entrando...</p>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Sem permissão — redirecionando...</p>
      </div>
    )
  }

  return <>{children}</>
}
