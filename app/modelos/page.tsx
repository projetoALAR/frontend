import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { TemplatesContent } from "@/components/templates/templates-content"

export default function ModelosPage() {
  return (
    <AppShell>
      <Header
        title="Modelos de documentos"
        description="Petições, contratos e procurações com preenchimento automático."
      />
      <div className="mt-6">
        <TemplatesContent />
      </div>
    </AppShell>
  )
}
