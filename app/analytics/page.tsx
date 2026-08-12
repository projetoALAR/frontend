"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { Button } from "@/components/ui/button"
import { processosApi } from "@/lib/processos-api"
import { formatDatePt } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)

  const exportToCSV = async () => {
    setExporting(true)
    try {
      const processos = await processosApi.listar()
      const headers = ["ID", "Número", "Título", "Status", "Prioridade", "Prazo", "Situação", "Cliente"]
      const rows = processos.map((c) => [
        c.id,
        `"${c.numero}"`,
        `"${c.titulo || ""}"`,
        `"${c.status}"`,
        c.prioridade || "",
        formatDatePt(c.prazo),
        c.concluido ? "Concluído" : "Em Andamento",
        `"${c.cliente?.nome || ""}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `relatorio-casos-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast({ title: "Relatório exportado", description: `${processos.length} caso(s) no CSV` })
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <Header
          title="Relatórios"
          description="Acompanhe o desempenho e as métricas de produtividade da equipe."
          actions={
            <Button
              onClick={() => void exportToCSV()}
              disabled={exporting}
              className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
            >
              {exporting ? "Exportando..." : "Exportar Relatório"}
            </Button>
          }
        />

        <div className="mt-6">
          <AnalyticsContent />
        </div>
      </main>
    </div>
  )
}
