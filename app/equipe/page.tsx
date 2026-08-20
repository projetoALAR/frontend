"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TeamContent } from "@/components/team/team-content"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { canManageEquipe } from "@/lib/roles"
import { FileSpreadsheet } from "lucide-react"
import { useState } from "react"
import { TeamImportDialog } from "@/components/team/team-import-dialog"

export default function EquipePage() {
  const { user } = useAuth()
  const canManage = canManageEquipe(user?.role)
  const [importOpen, setImportOpen] = useState(false)

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
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-9 text-sm bg-transparent"
                  onClick={() => setImportOpen(true)}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Importar
                </Button>
                <Button
                  onClick={handleAddMember}
                  className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
                >
                  + Adicionar Membro
                </Button>
              </div>
            ) : undefined
          }
        />

        <div className="mt-6">
          <TeamContent />
        </div>

        <TeamImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onImported={() => {
            window.dispatchEvent(new CustomEvent("reloadEquipe"))
          }}
        />
      </main>
    </div>
  )
}
