"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { Button } from "@/components/ui/button"
import { casesData } from "@/lib/shared-data"

function exportToCSV() {
  const headers = ["ID", "Título", "Projeto", "Prioridade", "Prazo", "Status"]
  const rows = casesData.map((c) => [
    c.id,
    `"${c.title}"`,
    `"${c.project}"`,
    c.priority,
    c.dueDate,
    c.completed ? "Concluído" : "Em Andamento",
  ])

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio-casos-${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 lg:ml-64">
        <Header
          title="Relatórios"
          description="Acompanhe o desempenho e as métricas de produtividade da equipe."
          actions={
            <Button
              onClick={exportToCSV}
              className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
            >
              Exportar Relatório
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
