"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessPath } from "@/lib/roles"

const PUBLIC_PATHS = ["/login"]

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
    return null
  }

  if (user && pathname === "/login") {
    return null
  }

  if (forbidden) {
    return null
  }

  return <>{children}</>
}
