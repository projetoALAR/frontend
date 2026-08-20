import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: ReactNode
  /** Classes extras no `main` (ex.: flex column no detalhe do caso). */
  mainClassName?: string
}

/** Layout padrão: sidebar fixa + área de conteúdo alinhada. */
export function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        id="main-content"
        className={cn(
          "flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden",
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  )
}
