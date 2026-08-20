"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { AuditoriaContent } from "@/components/auditoria/auditoria-content"

export default function AuditoriaPage() {
  return (
    <AppShell>
      <Header
        title="Auditoria"
        description="Quem criou, editou ou excluiu clientes, casos, documentos e usuários."
      />
      <div className="mt-6">
        <AuditoriaContent />
      </div>
    </AppShell>
  )
}
