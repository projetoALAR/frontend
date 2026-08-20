"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { RelatoriosCasos } from "@/components/analytics/relatorios-casos"

export default function RelatoriosPage() {
  return (
    <AppShell>
      <Header
        title="Relatórios"
        description="Métricas do escritório e recorte exportável dos casos."
      />
      <div className="mt-6 space-y-6">
        <AnalyticsContent />
        <RelatoriosCasos />
      </div>
    </AppShell>
  )
}
