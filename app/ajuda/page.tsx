import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { HelpContent } from "@/components/help/help-content"

export default function AjudaPage() {
  return (
    <AppShell>
      <Header
        title="Ajuda e Suporte"
        description="Encontre respostas para suas dúvidas e obtenha suporte sobre a plataforma Alar."
      />
      <div className="mt-6">
        <HelpContent />
      </div>
    </AppShell>
  )
}
