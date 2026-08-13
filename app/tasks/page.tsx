"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { GlobalSearch } from "@/components/search/global-search"
import { TasksContent } from "@/components/tasks/tasks-content"
import { Button } from "@/components/ui/button"
import { useRef, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"
import { casoHref } from "@/lib/caso-href"

function TasksPageContent() {
  const tasksContentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)
  const initialFilter = searchParams.get("filter") || "all"
  const caseId = searchParams.get("caseId")

  useEffect(() => {
    if (caseId) {
      router.replace(casoHref(caseId))
    }
  }, [caseId, router])

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newFilter !== "all") {
        params.set("filter", newFilter)
      } else {
        params.delete("filter")
      }
      router.replace(`/tasks?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const handleNewCase = () => {
    window.dispatchEvent(new CustomEvent("openNewCaseModal"))
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
            <Button
              className="shrink-0 h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              onClick={handleNewCase}
            >
              + Novo Caso
            </Button>
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

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <Suspense fallback={<div>Carregando...</div>}>
        <TasksPageContent />
      </Suspense>
    </div>
  )
}
