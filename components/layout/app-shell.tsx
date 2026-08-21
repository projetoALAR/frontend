import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: ReactNode
  /** Classes extras no `main` (ex.: flex column no detalhe do caso). */
  mainClassName?: string
  /** Sem max-width e sem wrapper — layouts full-bleed (chat, detalhe do caso). */
  fullWidth?: boolean
}

/** Layout padrão: sidebar fixa + área de conteúdo. */
export function AppShell({ children, mainClassName, fullWidth }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        id="main-content"
        className={cn(
          "flex-1 min-w-0 overflow-x-hidden md:ml-64",
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
    </div>
  )
}
