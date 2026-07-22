"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: any) => void
  event?: any
  isEditing?: boolean
}

export function EventModal({ isOpen, onClose, onSave, event, isEditing }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [time, setTime] = useState(event?.time || "")
  const [duration, setDuration] = useState(event?.duration || "")
  const [timeError, setTimeError] = useState("")
  const [durationError, setDurationError] = useState("")

  // Sincroniza os dados do evento quando o modal abre ou o evento muda
  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || "")
      setTime(event.time || "")
      setDuration(event.duration || "")
      setTimeError("")
      setDurationError("")
    } else if (isOpen && !event) {
      // Limpa os campos quando abrindo para novo evento
      setTitle("")
      setTime("")
      setDuration("")
      setTimeError("")
      setDurationError("")
    }
  }, [isOpen, event])

  // Valida formato de horário (HHhMM ou HH:MM)
  const validateTimeFormat = (value: string): boolean => {
    if (!value) return false
    const timeRegex = /^([0-1]?[0-9]|2[0-3])[h:]([0-5][0-9])$/
    return timeRegex.test(value.replace(" ", ""))
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTime(value)
    
    if (value && !validateTimeFormat(value)) {
      setTimeError("Formato inválido. Use: 09h00 ou 09:00")
    } else {
      setTimeError("")
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDuration(value)
    
    if (value && !validateTimeFormat(value)) {
      setDurationError("Formato inválido. Use: 1h00 ou 1:00")
    } else {
      setDurationError("")
    }
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert("Por favor, insira um título para o evento")
      return
    }
    
    if (!time) {
      alert("Por favor, insira o horário do evento")
      return
    }
    
    if (!duration) {
      alert("Por favor, insira a duração do evento")
      return
    }

    if (timeError || durationError) {
      alert("Por favor, corrija os erros de formato")
      return
    }

    const savedEvent = {
      id: event?.id || Date.now(),
      title: title.trim(),
      time,
      duration,
      type: event?.type || "meeting",
      color: event?.color || "bg-blue-400",
    }

    onSave(savedEvent)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Evento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Audiência - Ação Civil"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              value={time}
              onChange={handleTimeChange}
              placeholder="Ex: 09h00 ou 09:00"
              className={`mt-1 ${timeError ? "border-destructive" : ""}`}
            />
            {timeError && <p className="text-xs text-destructive mt-1">{timeError}</p>}
          </div>
          <div>
            <Label htmlFor="duration">Duração</Label>
            <Input
              id="duration"
              value={duration}
              onChange={handleDurationChange}
              placeholder="Ex: 1h00 ou 1:00"
              className={`mt-1 ${durationError ? "border-destructive" : ""}`}
            />
            {durationError && <p className="text-xs text-destructive mt-1">{durationError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
