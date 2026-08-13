"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { CompromissoFormData } from "@/lib/compromissos-api"
import { formatDateTimeLocalInput } from "@/lib/format"
import { processosApi } from "@/lib/processos-api"

export type CalendarEventView = {
  id: string
  titulo: string
  descricao?: string | null
  dataHora: string
  processoId?: string | null
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CompromissoFormData) => Promise<void>
  event?: CalendarEventView | null
  isEditing?: boolean
  lockedProcessoId?: string | null
}

export function EventModal({ isOpen, onClose, onSave, event, isEditing, lockedProcessoId }: EventModalProps) {
  const { toast } = useToast()
  const [titulo, setTitulo] = useState("")
  const [dataHora, setDataHora] = useState("")
  const [descricao, setDescricao] = useState("")
  const [processoId, setProcessoId] = useState<string>("")
  const [processos, setProcessos] = useState<{ id: string; label: string }[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || lockedProcessoId) return
    void processosApi
      .listar()
      .then((list) =>
        setProcessos(
          list.map((p) => ({
            id: p.id,
            label: `${p.numero}${p.titulo ? ` — ${p.titulo}` : ""}`,
          })),
        ),
      )
      .catch(() => setProcessos([]))
  }, [isOpen, lockedProcessoId])

  useEffect(() => {
    if (isOpen && event) {
      setTitulo(event.titulo || "")
      setDataHora(formatDateTimeLocalInput(event.dataHora))
      setDescricao(event.descricao || "")
      setProcessoId(lockedProcessoId || event.processoId || "")
    } else if (isOpen) {
      setTitulo("")
      setDataHora("")
      setDescricao("")
      setProcessoId(lockedProcessoId || "")
    }
  }, [isOpen, event, lockedProcessoId])

  const handleSave = async () => {
    if (!titulo.trim()) {
      toast({ title: "Erro", description: "Informe o título", variant: "destructive" })
      return
    }
    if (!dataHora) {
      toast({ title: "Erro", description: "Informe data e hora", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        dataHora: new Date(dataHora).toISOString(),
        processoId: lockedProcessoId || processoId || null,
      })
      toast({
        title: "Sucesso!",
        description: isEditing ? "Evento atualizado" : "Evento criado",
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
          <DialogTitle>{isEditing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="event-title">Título *</Label>
            <Input
              id="event-title"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Audiência"
              className="mt-1"
              disabled={isSaving}
            />
          </div>
          <div>
            <Label htmlFor="event-datetime">Data e hora *</Label>
            <Input
              id="event-datetime"
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="mt-1"
              disabled={isSaving}
            />
          </div>
          {!lockedProcessoId && (
          <div>
            <Label htmlFor="event-processo">Processo vinculado</Label>
            <Select
              value={processoId || "__none__"}
              onValueChange={(value) => setProcessoId(value === "__none__" ? "" : value)}
              disabled={isSaving}
            >
              <SelectTrigger id="event-processo" className="mt-1 w-full">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhum</SelectItem>
                {processos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}
          <div>
            <Label htmlFor="event-desc">Descrição</Label>
            <Input
              id="event-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Anotações opcionais"
              className="mt-1"
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={() => void handleSave()} disabled={isSaving}>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
