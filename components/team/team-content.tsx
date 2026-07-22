"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MoreHorizontal, Trash2, Pencil } from "lucide-react"
import { useState } from "react"
import { TeamMemberModal } from "./team-member-modal"
import { useToast } from "@/hooks/use-toast"

const INITIAL_TEAM_MEMBERS = [
  {
    id: 1,
    name: "Alexandra Deff",
    role: "Advogada Sênior - Direito Civil",
    email: "alexandra@alar.com.br",
    status: "active",
    tasks: 12,
    avatar: "/avatars/avatar-1.jpg",
    initials: "AD",
  },
  {
    id: 2,
    name: "Edwin Adenike",
    role: "Advogado - Direito Comercial",
    email: "edwin@alar.com.br",
    status: "active",
    tasks: 8,
    avatar: "/avatars/avatar-2.jpg",
    initials: "EA",
  },
  {
    id: 3,
    name: "Isaac Oluwatemilorun",
    role: "Advogado - Direito Trabalhista",
    email: "isaac@alar.com.br",
    status: "away",
    tasks: 15,
    avatar: "/avatars/avatar-3.jpg",
    initials: "IO",
  },
  {
    id: 4,
    name: "David Oshodi",
    role: "Consultor Jurídico",
    email: "david@alar.com.br",
    status: "active",
    tasks: 6,
    avatar: "/avatars/avatar-4.jpg",
    initials: "DO",
  },
]

export function TeamContent() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM_MEMBERS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)

  const handleSaveMember = (memberData: any) => {
    if (selectedMember) {
      setTeamMembers(teamMembers.map((m) => (m.id === selectedMember.id ? memberData : m)))
    } else {
      setTeamMembers([...teamMembers, memberData])
    }
    setSelectedMember(null)
  }

  const handleDeleteMember = (memberId: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId))
    toast({
      title: "Membro removido",
      description: "O membro foi removido da equipe",
    })
  }

  const handleEditMember = (member: any) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleAddMember = () => {
    setSelectedMember(null)
    setIsModalOpen(true)
  }

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`
    toast({
      title: "Email",
      description: `Abrindo cliente de email para ${email}`,
    })
  }

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`
    toast({
      title: "Chamada",
      description: `Iniciando chamada para ${phone}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleAddMember}
          className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
        >
          + Adicionar Membro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <Card
            key={member.id}
            className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMember(member)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMember(member.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>

              <Badge variant={member.status === "active" ? "default" : "secondary"}>
                {member.status === "active" ? "Ativo" : "Ausente"}
              </Badge>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Casos Ativos</span>
                  <span className="font-semibold">{member.tasks}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleEmailClick(member.email)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  E-mail
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handlePhoneClick(`${member.phone || "+5511999999999"}`)}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Ligar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

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
    </div>
  )
}
