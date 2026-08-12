import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TemplatesContent } from "@/components/templates/templates-content"

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-3 md:p-4 lg:p-5 md:ml-64 overflow-x-hidden">
        <Header
          title="Modelos de documentos"
          description="Biblioteca de petições, contratos e procurações com preenchimento automático."
        />

        <div className="mt-4 md:mt-5">
          <TemplatesContent />
        </div>
      </main>
    </div>
  )
}
