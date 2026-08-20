import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { ClientsContent } from "@/components/clients/clients-content"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { Suspense } from "react"

export default function ClientesPage() {
  return (
    <AppShell>
      <Header
        title="Clientes"
        description="Gerencie seus clientes e seus respectivos casos."
      />
      <div className="mt-6">
        <Suspense fallback={<ListSkeleton variant="cards" count={6} />}>
          <ClientsContent />
        </Suspense>
      </div>
    </AppShell>
  )
}
