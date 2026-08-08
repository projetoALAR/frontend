"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { CaseView } from "@/lib/processo-mapper"
import type { ProcessoFormData } from "@/lib/processos-api"
import { clientesApi, type ClienteApi } from "@/lib/clientes-api"
import {
  PROCESSO_STATUS_DEFAULT,
  isProcessoStatusConcluido,
  processoStatusOptionsFor,
} from "@/lib/processo-status"

interface CaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProcessoFormData) => Promise<void>
  caseData?: CaseView | null
  isEditing?: boolean
}

export function CaseModal({ isOpen, onClose, onSave, caseData, isEditing }: CaseModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [descricao, setDescricao] = useState("")
  const [numero, setNumero] = useState("")
  const [status, setStatus] = useState(PROCESSO_STATUS_DEFAULT)
  const [priority, setPriority] = useState("Média")
  const [dueDate, setDueDate] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [clientes, setClientes] = useState<ClienteApi[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    void clientesApi.listar().then(setClientes).catch(() => setClientes([]))
  }, [isOpen])

  useEffect(() => {
    if (isOpen && caseData) {
      setTitle(caseData.title || "")
      setDescricao(caseData.descricao || "")
      setNumero(caseData.numero || "")
      setStatus(caseData.status || PROCESSO_STATUS_DEFAULT)
      setPriority(caseData.priority || "Média")
      setDueDate(caseData.dueDateIso ? caseData.dueDateIso.slice(0, 10) : "")
      setClienteId(caseData.clienteId || "")
      setErrors({})
    } else if (isOpen) {
      setTitle("")
      setDescricao("")
      setNumero("")
      setStatus(PROCESSO_STATUS_DEFAULT)
      setPriority("Média")
      setDueDate("")
      setClienteId("")
      setErrors({})
    }
  }, [isOpen, caseData])

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = "Título é obrigatório"
    if (!numero.trim()) newErrors.numero = "Número do processo é obrigatório"
    if (!clienteId) newErrors.clienteId = "Cliente é obrigatório"
    if (!dueDate.trim()) newErrors.dueDate = "Prazo é obrigatório"
    if (!status.trim()) newErrors.status = "Status é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Erro na validação",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        titulo: title.trim(),
        numero: numero.trim(),
        status: status.trim(),
        clienteId,
        descricao: descricao.trim() || null,
        prioridade: priority,
        prazo: new Date(`${dueDate}T12:00:00`).toISOString(),
        concluido: isProcessoStatusConcluido(status) || (caseData?.completed ?? false),
        tags: caseData?.tags ?? [],
      })
      toast({
        title: "Sucesso!",
        description: isEditing ? "Caso atualizado com sucesso" : "Caso criado com sucesso",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o caso",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const statusOptions = processoStatusOptionsFor(status)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Caso" : "Novo Caso"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="case-title">Título *</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Análise de Contrato"
              className={`mt-1 ${errors.title ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <Label htmlFor="case-descricao">Descrição</Label>
            <Textarea
              id="case-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo do que se trata o caso (opcional)"
              className="mt-1 min-h-[88px] resize-y"
              disabled={isSaving}
            />
          </div>
          <div>
            <Label htmlFor="case-numero">Número CNJ do processo *</Label>
            <Input
              id="case-numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: 0001234-56.2026.8.26.0100"
              className={`mt-1 font-mono ${errors.numero ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO (necessário para sync DataJud)
            </p>
            {errors.numero && <p className="text-xs text-destructive mt-1">{errors.numero}</p>}
          </div>
          <div>
            <Label htmlFor="case-cliente">Cliente *</Label>
            <Select
              value={clienteId || undefined}
              onValueChange={setClienteId}
              disabled={isSaving}
            >
              <SelectTrigger
                id="case-cliente"
                className={`mt-1 w-full ${errors.clienteId ? "border-destructive" : ""}`}
                aria-invalid={!!errors.clienteId}
              >
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clienteId && <p className="text-xs text-destructive mt-1">{errors.clienteId}</p>}
          </div>
          <div>
            <Label htmlFor="case-status">Status *</Label>
            <Select value={status} onValueChange={setStatus} disabled={isSaving}>
              <SelectTrigger
                id="case-status"
                className={`mt-1 w-full ${errors.status ? "border-destructive" : ""}`}
                aria-invalid={!!errors.status}
              >
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive mt-1">{errors.status}</p>}
          </div>
          <div>
            <Label htmlFor="case-priority">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority} disabled={isSaving}>
              <SelectTrigger id="case-priority" className="mt-1 w-full">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="case-date">Prazo *</Label>
            <Input
              id="case-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`mt-1 ${errors.dueDate ? "border-destructive" : ""}`}
              disabled={isSaving}
            />
            {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent" disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSave()} className="bg-primary hover:bg-primary/90" disabled={isSaving}>
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
