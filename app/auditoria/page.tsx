"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AuditoriaContent } from "@/components/auditoria/auditoria-content"

export default function AuditoriaPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <Header
          title="Auditoria"
          description="Quem criou, editou ou excluiu clientes, casos, documentos e usuários."
        />

        <div className="mt-6">
          <AuditoriaContent />
        </div>
      </main>
    </div>
  )
}
