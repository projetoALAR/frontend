"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { NotificationsHost } from "@/components/layout/notifications-host"
import {
  FORCE_PASSWORD_PATH,
  MARKETING_PATHS,
  PUBLIC_AUTH_PATHS,
  pathMatches,
} from "@/lib/public-paths"

/**
 * Mantém Sidebar montada entre navegações autenticadas
 * (evita remount + refetch a cada troca de aba).
 */
export function AuthenticatedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const bare =
    pathMatches(pathname, PUBLIC_AUTH_PATHS) ||
    pathMatches(pathname, MARKETING_PATHS) ||
    pathname === FORCE_PASSWORD_PATH

  if (bare) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <NotificationsHost />
      <div className="flex min-w-0 flex-1 flex-col md:ml-64">{children}</div>
    </div>
  )
}
