"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

const PUBLIC_PATHS = ["/login"]

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  useEffect(() => {
    if (loading) return

    if (!user && !isPublic) {
      router.replace("/login")
      return
    }

    if (user && pathname === "/login") {
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

  return <>{children}</>
}
