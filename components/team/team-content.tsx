"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Trash2, Pencil, Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { TeamMemberModal } from "./team-member-modal"
import { ContactDialog } from "@/components/shared/contact-dialog"
import { useToast } from "@/hooks/use-toast"
import { equipeApi, type MembroEquipeApi, type MembroFormData } from "@/lib/equipe-api"
import { initialsFromName } from "@/lib/format"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import { useAuth } from "@/components/auth/auth-provider"
import { canManageEquipe, ROLE_LABELS } from "@/lib/roles"

export function TeamContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const canManage = canManageEquipe(user?.role)
  const [teamMembers, setTeamMembers] = useState<MembroEquipeApi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MembroEquipeApi | null>(null)
  const [contactMember, setContactMember] = useState<MembroEquipeApi | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setTeamMembers(await equipeApi.listar())
    } catch (error) {
      toast({
        title: "Erro ao carregar equipe",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!canManage) return
    const handleOpen = () => {
      setSelectedMember(null)
      setIsModalOpen(true)
    }
    window.addEventListener("openNewTeamMemberModal", handleOpen)
    return () => window.removeEventListener("openNewTeamMemberModal", handleOpen)
  }, [canManage])

  const handleSaveMember = async (data: MembroFormData) => {
    if (selectedMember) {
      const updated = await equipeApi.atualizar(selectedMember.id, data)
      setTeamMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? updated : m)))
    } else {
      const created = await equipeApi.criar(data)
      setTeamMembers((prev) => [created, ...prev])
    }
    invalidateDashboardCache()
    setSelectedMember(null)
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      await equipeApi.remover(memberId)
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
      invalidateDashboardCache()
      toast({ title: "Membro removido" })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {isLoading ? (
        <div className="flex justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando equipe...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.usuario?.fotoUrl || undefined} alt={member.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initialsFromName(member.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.nome}</h3>
                    <p className="text-sm text-muted-foreground">{member.cargo}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedMember(member)
                        setIsModalOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void handleDeleteMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status === "active" ? "Ativo" : member.status}
                  </Badge>
                  {member.usuario?.role ? (
                    <Badge variant="outline">{ROLE_LABELS[member.usuario.role]}</Badge>
                  ) : (
                    <Badge variant="secondary">Sem login</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => setContactMember(member)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  {member.email}
                </Button>
              </div>
            </Card>
          ))}
          {teamMembers.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">Nenhum membro cadastrado</p>
          )}
        </div>
      )}

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMember(null)
        }}
        onSave={handleSaveMember}
        memberData={selectedMember}
        isEditing={!!selectedMember}
      />

      {contactMember && (
        <ContactDialog
          open={!!contactMember}
          onOpenChange={(open) => !open && setContactMember(null)}
          alvoTipo="membro"
          alvoId={contactMember.id}
          alvoNome={contactMember.nome}
          canal="email"
          destino={contactMember.email}
        />
      )}
    </div>
  )
}
