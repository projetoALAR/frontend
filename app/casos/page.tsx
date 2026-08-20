"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { GlobalSearch } from "@/components/search/global-search"
import { TasksContent } from "@/components/tasks/tasks-content"
import { Button } from "@/components/ui/button"
import { useRef, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { FileSpreadsheet } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"
import { casoHref, rotas } from "@/lib/app-routes"
import { ListSkeleton } from "@/components/shared/list-skeleton"

function CasosPageContent() {
  const tasksContentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)
  const initialFilter = searchParams.get("filter") || "all"
  const caseId = searchParams.get("caseId")
  const abrirNovo = searchParams.get("novo") === "1"

  useEffect(() => {
    if (caseId) {
      router.replace(casoHref(caseId))
    }
  }, [caseId, router])

  useEffect(() => {
    if (!abrirNovo || !canWrite || caseId) return
    window.dispatchEvent(new CustomEvent("openNewCaseModal"))
    const params = new URLSearchParams(searchParams.toString())
    params.delete("novo")
    const qs = params.toString()
    router.replace(qs ? `${rotas.casos}?${qs}` : rotas.casos, { scroll: false })
  }, [abrirNovo, canWrite, caseId, router, searchParams])

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newFilter !== "all") {
        params.set("filter", newFilter)
      } else {
        params.delete("filter")
      }
      params.delete("novo")
      const qs = params.toString()
      router.replace(qs ? `${rotas.casos}?${qs}` : rotas.casos, { scroll: false })
    },
    [router, searchParams],
  )

  const handleNewCase = () => {
    window.dispatchEvent(new CustomEvent("openNewCaseModal"))
  }

  const handleImportCases = () => {
    window.dispatchEvent(new CustomEvent("openImportCasesModal"))
  }

  if (caseId) {
    return (
      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64">
        <p className="text-sm text-muted-foreground">Abrindo o caso...</p>
      </main>
    )
  }

  return (
    <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
      <header className="space-y-3 md:space-y-4 mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MobileNav />
            <GlobalSearch />
          </div>
          {canWrite && (
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                className="h-10 text-sm bg-transparent"
                onClick={handleImportCases}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Importar
              </Button>
              <Button
                className="h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                onClick={handleNewCase}
              >
                + Novo Caso
              </Button>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">Casos</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Gerencie e organize os casos da sua equipe com eficiência.</p>
        </div>
      </header>

      <div className="mt-6">
        <TasksContent
          ref={tasksContentRef}
          initialFilter={initialFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
    </main>
  )
}

export default function CasosPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <Suspense fallback={<ListSkeleton variant="rows" count={4} />}>
        <CasosPageContent />
      </Suspense>
    </div>
  )
}
