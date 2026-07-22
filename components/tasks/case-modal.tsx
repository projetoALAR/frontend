"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface CaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (caseData: any) => void
  caseData?: any
  isEditing?: boolean
}

export function CaseModal({ isOpen, onClose, onSave, caseData, isEditing }: CaseModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [project, setProject] = useState("")
  const [priority, setPriority] = useState("Média")
  const [dueDate, setDueDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && caseData) {
      setTitle(caseData.title || "")
      setProject(caseData.project || "")
      setPriority(caseData.priority || "Média")
      setDueDate(caseData.dueDate || "")
      setErrors({})
    } else if (isOpen) {
      setTitle("")
      setProject("")
      setPriority("Média")
      setDueDate("")
      setErrors({})
    }
  }, [isOpen, caseData])

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}
    const today = getTodayDate()

    if (!title.trim()) newErrors.title = "Título é obrigatório"
    if (!project.trim()) newErrors.project = "Projeto/Área é obrigatória"
    if (!dueDate.trim()) {
      newErrors.dueDate = "Data de vencimento é obrigatória"
    } else if (dueDate < today) {
      newErrors.dueDate = "Data de vencimento não pode ser no passado"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Erro na validação",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      return
    }

    onSave({
      id: caseData?.id || Date.now(),
      title: title.trim(),
      project: project.trim(),
      priority,
      dueDate,
      completed: caseData?.completed || false,
      tags: caseData?.tags || [],
    })

    toast({
      title: "Sucesso!",
      description: isEditing ? "Caso atualizado com sucesso" : "Caso criado com sucesso",
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Caso" : "Novo Caso"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="case-title">Título do Caso *</Label>
            <Input
              id="case-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: "" })
              }}
              placeholder="Ex: Análise de Contrato"
              className={`mt-1 ${errors.title ? "border-destructive" : ""}`}
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <Label htmlFor="case-project">Projeto/Área *</Label>
            <Input
              id="case-project"
              value={project}
              onChange={(e) => {
                setProject(e.target.value)
                if (errors.project) setErrors({ ...errors, project: "" })
              }}
              placeholder="Ex: Direito Comercial"
              className={`mt-1 ${errors.project ? "border-destructive" : ""}`}
            />
            {errors.project && <p className="text-xs text-destructive mt-1">{errors.project}</p>}
          </div>
          <div>
            <Label htmlFor="case-priority">Prioridade</Label>
            <select
              id="case-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-foreground"
            >
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
          <div>
            <Label htmlFor="case-date">Data de Vencimento *</Label>
            <Input
              id="case-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                if (errors.dueDate) setErrors({ ...errors, dueDate: "" })
              }}
              className={`mt-1 ${errors.dueDate ? "border-destructive" : ""}`}
            />
            {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
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
