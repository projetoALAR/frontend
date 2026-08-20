"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessPath } from "@/lib/roles"

const PUBLIC_PATHS = [
  "/login",
  "/sentry-test",
  "/esqueci-senha",
  "/redefinir-senha",
]

const FORCE_PASSWORD_PATH = "/trocar-senha"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const needsPasswordChange = Boolean(user?.mustChangePassword)
  const onForcePassword = pathname === FORCE_PASSWORD_PATH
  const forbidden = Boolean(
    user && !isPublic && !onForcePassword && !canAccessPath(pathname, user.role),
  )

  useEffect(() => {
    if (loading) return

    if (!user && !isPublic) {
      router.replace("/login")
      return
    }

    if (user && needsPasswordChange && !onForcePassword) {
      router.replace(FORCE_PASSWORD_PATH)
      return
    }

    if (user && !needsPasswordChange && onForcePassword) {
      router.replace("/")
      return
    }

    if (user && isPublic && !needsPasswordChange) {
      router.replace("/")
      return
    }

    if (user && !isPublic && !onForcePassword && !canAccessPath(pathname, user.role)) {
      router.replace("/")
    }
  }, [
    user,
    loading,
    isPublic,
    pathname,
    router,
    needsPasswordChange,
    onForcePassword,
  ])

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

  if (user && needsPasswordChange && !onForcePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecionando para trocar senha...</p>
      </div>
    )
  }

  if (user && isPublic && !needsPasswordChange) {
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
