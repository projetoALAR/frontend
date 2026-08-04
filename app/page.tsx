"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectAnalytics } from "@/components/dashboard/project-analytics"
import { Reminders } from "@/components/dashboard/reminders"
import { ProjectList } from "@/components/dashboard/project-list"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { TeamSummaryCard } from "@/components/dashboard/team-summary-card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  const handleNewCase = () => {
    router.push("/tasks")
    setTimeout(() => {
      const event = new CustomEvent("openNewCaseModal")
      window.dispatchEvent(event)
    }, 100)
  }

  const handleNewClient = () => {
    router.push("/clients")
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("openNewClientModal"))
    }, 100)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="Advocacia Alar"
          description="Acompanhe seus casos, clientes e documentações em um só lugar."
          actions={
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
          }
        />

        <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              <ProjectAnalytics />
              <ProjectList />
            </div>

            <div className="space-y-3 md:space-y-4">
              <Reminders />
              <ProjectProgress />
              <TeamSummaryCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
