"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { GlobalSearch } from "@/components/search/global-search"
import { CasePanel } from "@/components/tasks/case-panel"
import { Button } from "@/components/ui/button"
import { processosApi } from "@/lib/processos-api"
import { mapProcessoToCase, type CaseView } from "@/lib/processo-mapper"

export default function CasoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id
  const [caseData, setCaseData] = useState<CaseView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void processosApi
      .obter(id)
      .then((processo) => {
        if (!cancelled) setCaseData(mapProcessoToCase(processo))
      })
      .catch((err) => {
        if (!cancelled) {
          setCaseData(null)
          setError(err instanceof Error ? err.message : "Caso não encontrado")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        id="main-content"
        className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden flex flex-col min-h-screen"
      >
        <header className="flex items-center gap-2 mb-4 shrink-0">
          <MobileNav />
          <GlobalSearch />
        </header>

        {loading ? (
          <div
            role="status"
            className="flex-1 flex items-center justify-center gap-2 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            Carregando caso...
          </div>
        ) : error || !caseData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <p className="text-sm text-muted-foreground">{error || "Caso não encontrado"}</p>
            <Button variant="outline" onClick={() => router.push("/tasks")}>
              Voltar aos casos
            </Button>
          </div>
        ) : (
          <CasePanel
            layout="page"
            isOpen
            caseData={caseData}
            onClose={() => router.push("/tasks")}
            onUpdated={setCaseData}
          />
        )}
      </main>
    </div>
  )
}
