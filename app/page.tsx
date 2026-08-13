"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { Reminders } from "@/components/dashboard/reminders"
import { ProjectList } from "@/components/dashboard/project-list"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { TeamSummaryCard } from "@/components/dashboard/team-summary-card"
import { DashboardWelcomeCard } from "@/components/onboarding/dashboard-welcome-card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos, getHomeCopy } from "@/lib/roles"
import { clientesListaHref, casosListaHref } from "@/lib/app-routes"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)
  /** Gráficos e resumo no home: admin e advogado; assistente foca em agenda/lista. */
  const showGestaoWidgets = user?.role === "ADMIN" || user?.role === "ADVOGADO"
  const home = getHomeCopy(user?.role)

  const handleNewCase = () => {
    router.push(casosListaHref({ novo: true }))
  }

  const handleNewClient = () => {
    router.push(clientesListaHref({ novo: true }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-3 md:p-4 lg:p-5 md:ml-64 overflow-x-hidden">
        <Header
          title={home.title}
          description={home.description}
          actions={
            canWrite ? (
              <>
                <Button
                  onClick={handleNewCase}
                  className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
                >
                  + Casos
                </Button>
                <Button
                  onClick={handleNewClient}
                  className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
                >
                  + Cliente
                </Button>
              </>
            ) : undefined
          }
        />

        <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
          <DashboardWelcomeCard />
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2 space-y-3 md:space-y-4 min-w-0">
              {showGestaoWidgets && <ProjectAnalytics />}
              <ProjectList />
            </div>

            <div className="space-y-3 md:space-y-4 min-w-0">
              <Reminders />
              <ProjectProgress />
              {showGestaoWidgets && <TeamSummaryCard />}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
