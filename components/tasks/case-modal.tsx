"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import type { CaseView } from "@/lib/processo-mapper"
import type { ProcessoFormData } from "@/lib/processos-api"
import { clientesApi, type ClienteApi } from "@/lib/clientes-api"

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
  const [status, setStatus] = useState("Em andamento")
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
      setStatus(caseData.status || "Em andamento")
      setPriority(caseData.priority || "Média")
      setDueDate(caseData.dueDateIso ? caseData.dueDateIso.slice(0, 10) : "")
      setClienteId(caseData.clienteId || "")
      setErrors({})
    } else if (isOpen) {
      setTitle("")
      setDescricao("")
      setNumero("")
      setStatus("Em andamento")
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
        concluido: caseData?.completed ?? false,
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
            <Label htmlFor="case-numero">Número do processo *</Label>
            <Input
              id="case-numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex: 0001234-56.2026.8.26.0100"
              className={`mt-1 ${errors.numero ? "border-destructive" : ""}`}
              disabled={isSaving || !!isEditing}
            />
            {errors.numero && <p className="text-xs text-destructive mt-1">{errors.numero}</p>}
          </div>
          <div>
            <Label htmlFor="case-cliente">Cliente *</Label>
            <select
              id="case-cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-md border bg-transparent ${errors.clienteId ? "border-destructive" : "border-input"}`}
              disabled={isSaving}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            {errors.clienteId && <p className="text-xs text-destructive mt-1">{errors.clienteId}</p>}
          </div>
          <div>
            <Label htmlFor="case-status">Status / Área *</Label>
            <Input
              id="case-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Ex: Em andamento"
              className="mt-1"
              disabled={isSaving}
            />
          </div>
          <div>
            <Label htmlFor="case-priority">Prioridade</Label>
            <select
              id="case-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent"
              disabled={isSaving}
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
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
