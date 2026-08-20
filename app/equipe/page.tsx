"use client"

import { AppShell } from "@/components/layout/app-shell"
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
    <AppShell>
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
                className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
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
    </AppShell>
  )
}
