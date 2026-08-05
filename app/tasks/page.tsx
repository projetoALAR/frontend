"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { TasksContent } from "@/components/tasks/tasks-content"
import { Button } from "@/components/ui/button"
import { useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"

function TasksPageContent() {
  const tasksContentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)
  const initialFilter = searchParams.get("filter") || "all"
  const caseId = searchParams.get("caseId")

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

  return (
    <main className="flex-1 p-4 lg:p-6 lg:ml-64">
      <header className="space-y-3 md:space-y-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">Casos</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Gerencie e organize os casos da sua equipe com eficiência.</p>
        </div>
        {canWrite && (
          <Button 
            className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
            onClick={handleNewCase}
          >
            + Novo Caso
          </Button>
        )}
      </header>

      <div className="mt-6">
        <TasksContent
          ref={tasksContentRef}
          initialFilter={initialFilter}
          initialCaseId={caseId}
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
