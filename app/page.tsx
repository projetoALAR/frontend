"use client"

import dynamic from "next/dynamic"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
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

const ProjectAnalytics = dynamic(
  () =>
    import("@/components/dashboard/project-analytics").then(
      (m) => m.ProjectAnalytics,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-xl bg-muted/40" aria-hidden />
    ),
  },
)

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
                className="h-9 w-full text-sm sm:w-auto"
              >
                + Novo caso
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(clientesListaHref({ novo: true }))}
                className="h-9 w-full border-border/80 bg-transparent text-sm sm:w-auto"
              >
                + Cliente
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="mt-6 space-y-5">
        <DashboardWelcomeCard />
        <StatsCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          <div className="min-w-0 space-y-4 lg:col-span-2">
            {showGestaoWidgets && <ProjectAnalytics />}
            <ProjectList />
          </div>

          <div className="min-w-0 space-y-4">
            <Reminders />
            <ProjectProgress />
            {showGestaoWidgets && <TeamSummaryCard />}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
