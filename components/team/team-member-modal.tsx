"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { MembroEquipeApi, MembroFormData } from "@/lib/equipe-api"

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: MembroFormData) => Promise<void>
  memberData?: MembroEquipeApi | null
  isEditing?: boolean
}

export function TeamMemberModal({ isOpen, onClose, onSave, memberData, isEditing }: TeamMemberModalProps) {
  const { toast } = useToast()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cargo, setCargo] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && memberData) {
      setNome(memberData.nome || "")
      setEmail(memberData.email || "")
      setCargo(memberData.cargo || "")
    } else if (isOpen) {
      setNome("")
      setEmail("")
      setCargo("")
    }
  }, [isOpen, memberData])

  const handleSave = async () => {
    if (!nome.trim() || !email.trim() || !cargo.trim()) {
      toast({
        title: "Erro",
        description: "Preencha nome, e-mail e cargo",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        nome: nome.trim(),
        email: email.trim(),
        cargo: cargo.trim(),
        status: memberData?.status || "active",
      })
      toast({
        title: "Sucesso!",
        description: isEditing ? "Membro atualizado" : "Membro adicionado",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Membro" : "Novo Membro"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="member-name">Nome *</Label>
            <Input id="member-name" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1" disabled={isSaving} />
          </div>
          <div>
            <Label htmlFor="member-email">E-mail *</Label>
            <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" disabled={isSaving} />
          </div>
          <div>
            <Label htmlFor="member-role">Cargo *</Label>
            <Input id="member-role" value={cargo} onChange={(e) => setCargo(e.target.value)} className="mt-1" disabled={isSaving} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
