"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { MembroEquipeApi, MembroFormData } from "@/lib/equipe-api"
import type { Role } from "@/lib/auth-api"
import { ROLE_LABELS } from "@/lib/roles"
import { PasswordHints } from "@/components/password-hints"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [senha, setSenha] = useState("")
  const [role, setRole] = useState<Role>("ASSISTENTE")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && memberData) {
      setNome(memberData.nome || "")
      setEmail(memberData.email || "")
      setCargo(memberData.cargo || "")
      setRole(memberData.usuario?.role || "ASSISTENTE")
      setSenha("")
    } else if (isOpen) {
      setNome("")
      setEmail("")
      setCargo("")
      setSenha("")
      setRole("ASSISTENTE")
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

    if (!isEditing && senha && senha.length < 8) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 8 caracteres",
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
        ...(isEditing
          ? { role }
          : {
              role,
              ...(senha ? { senha } : {}),
            }),
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
          <div>
            <Label htmlFor="member-papel">Papel de acesso</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
              disabled={isSaving || (isEditing && !memberData?.usuarioId)}
            >
              <SelectTrigger id="member-papel" className="mt-1 w-full">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isEditing && (
            <div>
              <Label htmlFor="member-senha">Senha de acesso</Label>
              <Input
                id="member-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1"
                disabled={isSaving}
                placeholder="Obrigatória se o e-mail ainda não tiver login"
                minLength={10}
              />
              <PasswordHints senha={senha} />
              <p className="text-xs text-muted-foreground mt-1">
                Se o e-mail já for de um usuário, o membro é vinculado. Caso contrário, informe a senha para criar a conta.
              </p>
            </div>
          )}
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
