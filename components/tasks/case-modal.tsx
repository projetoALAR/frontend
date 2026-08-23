"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
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
import { equipeApi, type MembroEquipeApi } from "@/lib/equipe-api"
import { ROLE_LABELS } from "@/lib/roles"
import { useAuth } from "@/components/auth/auth-provider"
import { maskProcessoNumero } from "@/lib/masks"
import { validarDigitoCnj } from "@/lib/cnj"
import {
  PROCESSO_STATUS_DEFAULT,
  PROCESSO_STATUS_OPTIONS,
  isProcessoStatusConcluido,
  processoStatusOptionsFor,
  type ProcessoStatus,
} from "@/lib/processo-status"

interface CaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProcessoFormData) => Promise<void>
  caseData?: CaseView | null
  isEditing?: boolean
}

function asProcessoStatus(value: string): ProcessoStatus {
  return (PROCESSO_STATUS_OPTIONS as readonly string[]).includes(value)
    ? (value as ProcessoStatus)
    : PROCESSO_STATUS_DEFAULT
}

export function CaseModal({ isOpen, onClose, onSave, caseData, isEditing }: CaseModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [descricao, setDescricao] = useState("")
  const [numero, setNumero] = useState("")
  const [status, setStatus] = useState<ProcessoStatus>(PROCESSO_STATUS_DEFAULT)
  const [priority, setPriority] = useState("Média")
  const [dueDate, setDueDate] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [responsavelId, setResponsavelId] = useState("")
  const [coResponsavelId, setCoResponsavelId] = useState("")
  const [clientes, setClientes] = useState<ClienteApi[]>([])
  const [equipe, setEquipe] = useState<MembroEquipeApi[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    void clientesApi.listar().then(setClientes).catch(() => setClientes([]))
    void equipeApi.listar().then(setEquipe).catch(() => setEquipe([]))
  }, [isOpen])

  useEffect(() => {
    if (isOpen && caseData) {
      setTitle(caseData.title || "")
      setDescricao(caseData.descricao || "")
      setNumero(caseData.numero || "")
      setStatus(asProcessoStatus(caseData.status || PROCESSO_STATUS_DEFAULT))
      setPriority(caseData.priority || "Média")
      setDueDate(caseData.dueDateIso ? caseData.dueDateIso.slice(0, 10) : "")
      setClienteId(caseData.clienteId || "")
      setResponsavelId(caseData.responsavelId || "")
      setCoResponsavelId(caseData.coResponsavelId || "")
      setErrors({})
    } else if (isOpen) {
      setTitle("")
      setDescricao("")
      setNumero("")
      setStatus(PROCESSO_STATUS_DEFAULT)
      setPriority("Média")
      setDueDate("")
      setClienteId("")
      setResponsavelId(user?.id || "")
      setCoResponsavelId("")
      setErrors({})
    }
  }, [isOpen, caseData, user?.id])

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = "Título é obrigatório"
    if (!numero.trim()) newErrors.numero = "Número do processo é obrigatório"
    else if (!validarDigitoCnj(numero)) {
      newErrors.numero =
        "Número CNJ inválido — confira os 20 dígitos e o dígito verificador"
    }
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
      const firstId = Object.keys(newErrors)[0]
      const el = document.getElementById(
        firstId === "title"
          ? "case-title"
          : firstId === "numero"
            ? "case-numero"
            : firstId === "clienteId"
              ? "case-cliente"
              : firstId === "dueDate"
                ? "case-date"
                : "case-status",
      )
      el?.focus()
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        titulo: title.trim(),
        numero: maskProcessoNumero(numero.trim()),
        status: status.trim(),
        clienteId,
        descricao: descricao.trim() || null,
        prioridade: priority,
        prazo: new Date(`${dueDate}T12:00:00`).toISOString(),
        concluido: isProcessoStatusConcluido(status) || (caseData?.completed ?? false),
        tags: caseData?.tags ?? [],
        responsavelId: responsavelId || null,
        coResponsavelId: coResponsavelId || null,
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
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "case-title-error" : undefined}
            />
            {errors.title && (
              <p id="case-title-error" role="alert" className="text-xs text-destructive mt-1">
                {errors.title}
              </p>
            )}
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
            <MaskedInput
              id="case-numero"
              mask="processo"
              value={numero}
              onValueChange={(v) => {
                setNumero(v)
                if (errors.numero) setErrors({ ...errors, numero: "" })
              }}
              placeholder="0001234-56.2026.8.26.0100"
              className={`mt-1 font-mono ${errors.numero ? "border-destructive" : ""}`}
              disabled={isSaving}
              aria-invalid={!!errors.numero}
              aria-describedby={
                errors.numero ? "case-numero-error case-numero-hint" : "case-numero-hint"
              }
            />
            <p id="case-numero-hint" className="text-xs text-muted-foreground mt-1">
              Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO (necessário para sync DataJud)
            </p>
            {errors.numero && (
              <p id="case-numero-error" role="alert" className="text-xs text-destructive mt-1">
                {errors.numero}
              </p>
            )}
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
                aria-describedby={errors.clienteId ? "case-cliente-error" : undefined}
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
            {errors.clienteId && (
              <p id="case-cliente-error" role="alert" className="text-xs text-destructive mt-1">
                {errors.clienteId}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="case-responsavel">Responsável</Label>
            <Select
              value={responsavelId || undefined}
              onValueChange={(v) => setResponsavelId(v === "none" ? "" : v)}
              disabled={isSaving}
            >
              <SelectTrigger id="case-responsavel" className="mt-1 w-full">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável</SelectItem>
                {equipe
                  .filter((m) => m.usuarioId)
                  .map((m) => (
                    <SelectItem key={m.usuarioId!} value={m.usuarioId!}>
                      {m.nome}
                      {m.usuario?.role ? ` · ${ROLE_LABELS[m.usuario.role]}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="case-co-responsavel">Co-responsável</Label>
            <Select
              value={coResponsavelId || undefined}
              onValueChange={(v) => setCoResponsavelId(v === "none" ? "" : v)}
              disabled={isSaving}
            >
              <SelectTrigger id="case-co-responsavel" className="mt-1 w-full">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {equipe
                  .filter((m) => m.usuarioId && m.usuarioId !== responsavelId)
                  .map((m) => (
                    <SelectItem key={m.usuarioId!} value={m.usuarioId!}>
                      {m.nome}
                      {m.usuario?.role ? ` · ${ROLE_LABELS[m.usuario.role]}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="case-status">Status *</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(asProcessoStatus(v))}
              disabled={isSaving}
            >
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
