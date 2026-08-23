"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessPath } from "@/lib/roles"
import {
  billingEnforceAtivo,
  usuarioTemAcessoAssinatura,
} from "@/lib/planos"
import { rotas } from "@/lib/app-routes"
import {
  FORCE_PASSWORD_PATH,
  MARKETING_PATHS,
  PUBLIC_AUTH_PATHS,
  pathMatches,
} from "@/lib/public-paths"

function destinoSeguroAposLogin(
  next: string | null,
  lacksPlan: boolean,
): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    if (lacksPlan && !pathMatches(next, MARKETING_PATHS)) {
      return rotas.planos
    }
    return next
  }
  return lacksPlan ? rotas.planos : rotas.painel
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPublic = pathMatches(pathname, PUBLIC_AUTH_PATHS)
  const isMarketing = pathMatches(pathname, MARKETING_PATHS)
  const needsPasswordChange = Boolean(user?.mustChangePassword)
  const onForcePassword = pathname === FORCE_PASSWORD_PATH
  const enforceBilling = billingEnforceAtivo()
  const hasSubscription = usuarioTemAcessoAssinatura(user?.id)
  const lacksPlan =
    enforceBilling &&
    Boolean(user) &&
    !needsPasswordChange &&
    !hasSubscription

  const needsPlan = lacksPlan && !isMarketing && !onForcePassword

  const forbidden = Boolean(
    user &&
      !isPublic &&
      !isMarketing &&
      !onForcePassword &&
      !canAccessPath(pathname, user.role),
  )

  useEffect(() => {
    if (loading) return

    if (!user && !isPublic && !isMarketing) {
      router.replace(rotas.login)
      return
    }

    if (user && needsPasswordChange && !onForcePassword) {
      router.replace(FORCE_PASSWORD_PATH)
      return
    }

    if (user && !needsPasswordChange && onForcePassword) {
      router.replace(destinoSeguroAposLogin(null, lacksPlan))
      return
    }

    // Logado em /login etc.: honra ?next= (e ?plano= via next já montado no login)
    if (user && isPublic && !needsPasswordChange) {
      const next =
        searchParams.get("next") ||
        (searchParams.get("plano")
          ? `${rotas.planos}?plano=${encodeURIComponent(searchParams.get("plano")!)}`
          : null)
      router.replace(destinoSeguroAposLogin(next, lacksPlan))
      return
    }

    if (needsPlan) {
      router.replace(rotas.planos)
      return
    }

    if (
      user &&
      !isPublic &&
      !isMarketing &&
      !onForcePassword &&
      !canAccessPath(pathname, user.role)
    ) {
      router.replace(rotas.painel)
    }
  }, [
    user,
    loading,
    isPublic,
    isMarketing,
    pathname,
    router,
    needsPasswordChange,
    onForcePassword,
    needsPlan,
    lacksPlan,
    searchParams,
  ])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando sessão...</p>
      </div>
    )
  }

  if (!user && !isPublic && !isMarketing) {
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

  if (needsPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Escolha um plano para continuar...</p>
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
