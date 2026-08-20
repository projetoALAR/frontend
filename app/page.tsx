"use client"

import { AppShell } from "@/components/layout/app-shell"
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
  const showGestaoWidgets = user?.role === "ADMIN" || user?.role === "ADVOGADO"
  const home = getHomeCopy(user?.role)

  return (
    <AppShell>
      <Header
        title={home.title}
        description={home.description}
        actions={
          canWrite ? (
            <>
              <Button
                onClick={() => router.push(casosListaHref({ novo: true }))}
                className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                + Casos
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(clientesListaHref({ novo: true }))}
                className="w-full sm:w-auto h-9 text-sm"
              >
                + Cliente
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mt-6 space-y-4 md:space-y-5">
        <DashboardWelcomeCard />
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {showGestaoWidgets && <ProjectAnalytics />}
            <ProjectList />
          </div>

          <div className="space-y-4 min-w-0">
            <Reminders />
            <ProjectProgress />
            {showGestaoWidgets && <TeamSummaryCard />}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
