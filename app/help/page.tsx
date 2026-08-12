import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { HelpContent } from "@/components/help/help-content"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <Header title="Ajuda e Suporte" description="Encontre respostas para suas dúvidas e obtenha suporte sobre a plataforma Alar." />

        <div className="mt-6">
          <HelpContent />
        </div>
      </main>
    </div>
  )
}
