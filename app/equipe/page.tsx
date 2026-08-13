"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TeamContent } from "@/components/team/team-content"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { canManageEquipe } from "@/lib/roles"

export default function EquipePage() {
  const { user } = useAuth()
  const canManage = canManageEquipe(user?.role)

  const handleAddMember = () => {
    window.dispatchEvent(new CustomEvent("openNewTeamMemberModal"))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <Header
          title="Equipe"
          description="Gerencie os membros da sua equipe e suas funções."
          actions={
            canManage ? (
              <Button
                onClick={handleAddMember}
                className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
              >
                + Adicionar Membro
              </Button>
            ) : undefined
          }
        />

        <div className="mt-6">
          <TeamContent />
        </div>
      </main>
    </div>
  )
}
