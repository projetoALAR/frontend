"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memberData: any) => void
  memberData?: any
  isEditing?: boolean
}

const ROLES = [
  "Advogado(a) Sênior - Direito Civil",
  "Advogado(a) - Direito Comercial",
  "Advogado(a) - Direito Trabalhista",
  "Consultor(a) Jurídico",
  "Estagiário(a) de Direito",
  "Assistente Jurídico",
]

export function TeamMemberModal({ isOpen, onClose, onSave, memberData, isEditing }: TeamMemberModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && memberData) {
      setName(memberData.name || "")
      setEmail(memberData.email || "")
      setRole(memberData.role || "")
      setErrors({})
    } else if (isOpen) {
      setName("")
      setEmail("")
      setRole("")
      setErrors({})
    }
  }, [isOpen, memberData])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Nome é obrigatório"
    if (!email.trim()) newErrors.email = "Email é obrigatório"
    else if (!validateEmail(email.trim())) newErrors.email = "Email inválido"
    if (!role) newErrors.role = "Cargo é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      return
    }

    onSave({
      id: memberData?.id || Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      status: "active",
      tasks: 0,
      avatar: "/avatars/avatar-default.jpg",
      initials: name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    })

    toast({
      title: "Sucesso!",
      description: isEditing ? "Membro atualizado com sucesso" : "Membro adicionado com sucesso",
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Membro" : "Adicionar Membro à Equipe"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="member-name">Nome Completo *</Label>
            <Input
              id="member-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              placeholder="Ex: João Silva"
              className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="member-email">Email *</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              placeholder="Ex: joao@alar.com.br"
              className={`mt-1 ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="member-role">Cargo *</Label>
            <select
              id="member-role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                if (errors.role) setErrors({ ...errors, role: "" })
              }}
              className={`w-full mt-1 px-3 py-2 rounded-md border ${
                errors.role ? "border-destructive" : "border-input"
              } bg-transparent text-foreground`}
            >
              <option value="">Selecione um cargo</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            {isEditing ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
