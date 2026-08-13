"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { RelatoriosCasos } from "@/components/analytics/relatorios-casos"

export default function RelatoriosPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <Header
          title="Relatórios"
          description="Métricas do escritório e recorte exportável dos casos."
        />

        <div className="mt-6 space-y-6">
          <AnalyticsContent />
          <RelatoriosCasos />
        </div>
      </main>
    </div>
  )
}
