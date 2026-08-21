"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { CasePanel } from "@/components/tasks/case-panel"
import { Button } from "@/components/ui/button"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { processosApi } from "@/lib/processos-api"
import { mapProcessoToCase, type CaseView } from "@/lib/processo-mapper"
import { rotas } from "@/lib/app-routes"
import { FolderKanban } from "lucide-react"

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
    <AppShell fullWidth mainClassName="flex flex-col min-h-screen">
      <div className="shrink-0 mb-4">
        <Header
          title="Caso"
          description="Ficha do processo — prazos, documentos e andamentos."
        />
      </div>

      {loading ? (
        <ListSkeleton variant="detail" />
      ) : error || !caseData ? (
        <ListEmptyState
          icon={FolderKanban}
          title="Caso não encontrado"
          description={error || "Este caso não existe ou você não tem acesso."}
        >
          <Button variant="outline" onClick={() => router.push(rotas.casos)}>
            Voltar aos casos
          </Button>
        </ListEmptyState>
      ) : (
        <CasePanel
          layout="page"
          isOpen
          caseData={caseData}
          onClose={() => router.push(rotas.casos)}
          onUpdated={setCaseData}
        />
      )}
    </AppShell>
  )
}
