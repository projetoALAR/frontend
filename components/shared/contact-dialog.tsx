"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { inboxApi } from "@/lib/inbox-api"
import { formatPhone, onlyDigits } from "@/lib/masks"
import { useToast } from "@/hooks/use-toast"

type ContactDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  alvoTipo: "cliente" | "membro"
  alvoId: string
  alvoNome: string
  canal: "email" | "telefone"
  destino: string
}

export function ContactDialog({
  open,
  onOpenChange,
  alvoTipo,
  alvoId,
  alvoNome,
  canal,
  destino,
}: ContactDialogProps) {
  const { toast } = useToast()
  const [observacao, setObservacao] = useState("")
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await inboxApi.registrarContato({
        alvoTipo,
        alvoId,
        alvoNome,
        canal,
        destino,
        observacao: observacao.trim() || undefined,
      })
      toast({
        title: "Contato registrado",
        description: `Abrindo ${canal === "email" ? "e-mail" : "telefone"}...`,
      })
      onOpenChange(false)
      setObservacao("")
      if (canal === "email") {
        window.location.href = `mailto:${destino}`
      } else {
        window.location.href = `tel:${onlyDigits(destino)}`
      }
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {canal === "email" ? "Enviar e-mail" : "Ligar"} — {alvoNome}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Destino:{" "}
            <span className="font-medium text-foreground">
              {canal === "telefone" ? formatPhone(destino) : destino}
            </span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="obs">Observação (opcional)</Label>
            <Input
              id="obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: retorno sobre audiência"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => void handleConfirm()} disabled={saving}>
            {saving ? "Salvando..." : "Registrar e abrir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
