"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
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
    return <p className="text-sm text-muted-foreground">Abrindo o caso...</p>
  }

  return (
    <>
      <Header
        title="Casos"
        description="Gerencie e organize os casos da sua equipe com eficiência."
        actions={
          canWrite ? (
            <>
              <Button
                variant="outline"
                className="h-10 text-sm bg-transparent"
                onClick={handleImportCases}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Importar
              </Button>
              <Button
                className="h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleNewCase}
              >
                + Novo Caso
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mt-6">
        <TasksContent
          ref={tasksContentRef}
          initialFilter={initialFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
    </>
  )
}

export default function CasosPage() {
  return (
    <AppShell>
      <Suspense fallback={<ListSkeleton variant="rows" count={4} />}>
        <CasosPageContent />
      </Suspense>
    </AppShell>
  )
}
