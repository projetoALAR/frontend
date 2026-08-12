"use client"

import { useRouter } from "next/navigation"
import { Briefcase, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"

export function DashboardWelcomeCard() {
  const router = useRouter()
  const { user } = useAuth()
  const { data, loading } = useDashboardResumo()
  const canWrite = canWriteClientesProcessos(user?.role)

  if (loading || !data) return null
  if (data.totalProcessos > 0 && data.totalClientes > 0) return null

  return (
    <Card className="p-4 md:p-6 border-dashed bg-secondary/30">
      <ListEmptyState
        icon={Briefcase}
        title={
          data.totalClientes === 0
            ? "Seu escritório ainda está vazio"
            : "Nenhum caso cadastrado"
        }
        description={
          data.totalClientes === 0
            ? "Cadastre o primeiro cliente e abra um caso para ver prazos, documentos e timeline."
            : "Você já tem clientes — crie o primeiro caso para organizar prazos e andamentos."
        }
        className="border-0 p-0 md:p-0"
      >
        {canWrite && (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {data.totalClientes === 0 && (
              <Button
                className="flex-1"
                onClick={() => {
                  router.push("/clients")
                  setTimeout(() => window.dispatchEvent(new CustomEvent("openNewClientModal")), 150)
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Novo cliente
              </Button>
            )}
            <Button
              variant={data.totalClientes === 0 ? "outline" : "default"}
              className="flex-1"
              onClick={() => {
                router.push("/tasks")
                setTimeout(() => window.dispatchEvent(new CustomEvent("openNewCaseModal")), 150)
              }}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Novo caso
            </Button>
          </div>
        )}
      </ListEmptyState>
    </Card>
  )
}
