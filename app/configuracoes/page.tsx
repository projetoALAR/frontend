import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function ConfiguracoesPage() {
  return (
    <AppShell>
      <Header
        title="Configurações"
        description="Gerencie as preferências da sua conta e as configurações do sistema."
      />
      <div className="mt-6">
        <SettingsContent />
      </div>
    </AppShell>
  )
}
