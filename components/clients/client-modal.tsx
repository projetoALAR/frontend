"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { ClienteCard, ClienteFormData } from "@/lib/clientes-api"
import { maskCpf, maskPhone, onlyDigits } from "@/lib/masks"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clientData: ClienteFormData) => Promise<void>
  clientData?: ClienteCard | null
  isEditing?: boolean
}

export function ClientModal({ isOpen, onClose, onSave, clientData, isEditing }: ClientModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && clientData) {
      setName(clientData.name || "")
      setEmail(clientData.email || "")
      setPhone(maskPhone(clientData.phone || ""))
      setCpf(maskCpf(clientData.cpf || ""))
      setErrors({})
    } else if (isOpen) {
      setName("")
      setEmail("")
      setPhone("")
      setCpf("")
      setErrors({})
    }
  }, [isOpen, clientData])

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value)
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Nome é obrigatório"
    const cpfAnon = /^ANON/i.test(cpf.trim())
    const cpfDigits = onlyDigits(cpf)
    if (!cpf.trim()) newErrors.cpf = "CPF é obrigatório"
    else if (!cpfAnon && cpfDigits.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos"
    if (email.trim() && !validateEmail(email.trim())) {
      newErrors.email = "Email inválido"
    }
    const phoneDigits = onlyDigits(phone)
    if (phone.trim() && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      newErrors.phone = "Telefone deve ter DDD + 8 ou 9 dígitos"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        nome: name.trim(),
        cpf: cpfAnon ? cpf.trim() : cpfDigits,
        email: email.trim() || undefined,
        telefone: phone.trim() ? maskPhone(phone) : undefined,
      })

      toast({
        title: "Sucesso!",
        description: isEditing ? "Cliente atualizado com sucesso" : "Cliente criado com sucesso",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o cliente",
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
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="client-name">Nome *</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              placeholder="Ex: Matheus Silva"
              className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="client-cpf">CPF *</Label>
            <MaskedInput
              id="client-cpf"
              mask="cpf"
              value={cpf}
              onValueChange={(v) => {
                setCpf(v)
                if (errors.cpf) setErrors({ ...errors, cpf: "" })
              }}
              placeholder="000.000.000-00"
              className={`mt-1 font-mono ${errors.cpf ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
          </div>

          <div>
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              placeholder="Ex: contato@email.com"
              className={`mt-1 ${errors.email ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="client-phone">Telefone</Label>
            <MaskedInput
              id="client-phone"
              mask="phone"
              value={phone}
              onValueChange={(v) => {
                setPhone(v)
                if (errors.phone) setErrors({ ...errors, phone: "" })
              }}
              placeholder="(11) 99999-9999"
              className={`mt-1 font-mono ${errors.phone ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent" disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
