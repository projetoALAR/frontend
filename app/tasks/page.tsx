"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { TasksContent } from "@/components/tasks/tasks-content"
import { Button } from "@/components/ui/button"
import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"

function TasksPageContent() {
  const tasksContentRef = useRef<any>(null)
  const router = useRouter()
  const [initialFilter] = useState<string>("all")

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      const params = new URLSearchParams()
      if (newFilter !== "all") {
        params.set("filter", newFilter)
      }
      router.replace(`/tasks?${params.toString()}`, { scroll: false })
    },
    [router],
  )

  const handleNewCase = () => {
    const event = new CustomEvent("openNewCaseModal")
    window.dispatchEvent(event)
  }

  return (
    <main className="flex-1 p-4 lg:p-6 lg:ml-64">
      <header className="space-y-3 md:space-y-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">Casos</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Gerencie e organize os casos da sua equipe com eficiência.</p>
        </div>
        <Button 
          className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
          onClick={handleNewCase}
        >
          + Novo Caso
        </Button>
      </header>

      <div className="mt-6">
        <TasksContent ref={tasksContentRef} initialFilter={initialFilter} onFilterChange={handleFilterChange} />
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
