import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function ConfiguracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <Header title="Configurações" description="Gerencie as preferências da sua conta e as configurações do sistema." />

        <div className="mt-6">
          <SettingsContent />
        </div>
      </main>
    </div>
  )
}
