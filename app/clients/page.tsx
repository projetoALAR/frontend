import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ClientsContent } from "@/components/clients/clients-content"

export default function ClientsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="Clientes"
          description="Gerencie seus clientes e seus respectivos casos."
        />

        <div className="mt-4 md:mt-5">
          <ClientsContent />
        </div>
      </main>
    </div>
  )
}
