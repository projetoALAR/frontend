"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clientData: any) => void
  clientData?: any
  isEditing?: boolean
}

export function ClientModal({ isOpen, onClose, onSave, clientData, isEditing }: ClientModalProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [address, setAddress] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && clientData) {
      setName(clientData.name || "")
      setEmail(clientData.email || "")
      setPhone(clientData.phone || "")
      setCnpj(clientData.cnpj || "")
      setAddress(clientData.address || "")
      setErrors({})
    } else if (isOpen) {
      setName("")
      setEmail("")
      setPhone("")
      setCnpj("")
      setAddress("")
      setErrors({})
    }
  }, [isOpen, clientData])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Nome é obrigatório"
    if (!email.trim()) newErrors.email = "Email é obrigatório"
    else if (!validateEmail(email.trim())) newErrors.email = "Email inválido"
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório"
    if (!cnpj.trim()) newErrors.cnpj = "CNPJ é obrigatório"

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
      id: clientData?.id || Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cnpj: cnpj.trim(),
      address: address.trim(),
    })

    toast({
      title: "Sucesso!",
      description: isEditing ? "Cliente atualizado com sucesso" : "Cliente criado com sucesso",
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="client-name">Nome/Razão Social *</Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: "" })
              }}
              placeholder="Ex: Empresa ABC Ltda."
              className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="client-email">Email *</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              placeholder="Ex: contato@empresa.com"
              className={`mt-1 ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="client-phone">Telefone *</Label>
            <Input
              id="client-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (errors.phone) setErrors({ ...errors, phone: "" })
              }}
              placeholder="Ex: (11) 99999-9999"
              className={`mt-1 ${errors.phone ? "border-destructive" : ""}`}
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="client-cnpj">CNPJ *</Label>
            <Input
              id="client-cnpj"
              value={cnpj}
              onChange={(e) => {
                setCnpj(e.target.value)
                if (errors.cnpj) setErrors({ ...errors, cnpj: "" })
              }}
              placeholder="Ex: 12.345.678/0001-90"
              className={`mt-1 ${errors.cnpj ? "border-destructive" : ""}`}
            />
            {errors.cnpj && <p className="text-xs text-destructive mt-1">{errors.cnpj}</p>}
          </div>

          <div>
            <Label htmlFor="client-address">Endereço</Label>
            <Input
              id="client-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Rua ABC, 123, São Paulo - SP"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            {isEditing ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
