import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: ReactNode
  /** Classes extras no `main` (ex.: flex column no detalhe do caso). */
  mainClassName?: string
  /** Sem max-width e sem wrapper — layouts full-bleed (chat, detalhe do caso). */
  fullWidth?: boolean
}

/**
 * Área de conteúdo (a Sidebar fica no AuthenticatedShell persistente).
 */
export function AppShell({ children, mainClassName, fullWidth }: AppShellProps) {
  return (
    <main
      id="main-content"
      className={cn(
        "min-w-0 flex-1 overflow-x-hidden",
        !fullWidth && "px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
        mainClassName,
      )}
    >
      {fullWidth ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      )}
    </main>
  )
}
