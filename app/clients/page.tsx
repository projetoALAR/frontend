import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ClientsContent } from "@/components/clients/clients-content"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { Suspense } from "react"

export default function ClientsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-3 md:p-4 lg:p-5 md:ml-64 overflow-x-hidden">
        <Header
          title="Clientes"
          description="Gerencie seus clientes e seus respectivos casos."
        />

        <div className="mt-4 md:mt-5">
          <Suspense fallback={<ListSkeleton variant="cards" count={6} />}>
            <ClientsContent />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
