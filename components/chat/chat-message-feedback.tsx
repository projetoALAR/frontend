"use client"

import { useState } from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ChatMessageFeedbackProps = {
  messageId: string
  feedback?: "util" | "nao_util" | null
  onFeedback: (
    messageId: string,
    util: boolean,
    motivo?: string,
  ) => void | Promise<void>
  disabled?: boolean
}

export function ChatMessageFeedback({
  messageId,
  feedback,
  onFeedback,
  disabled = false,
}: ChatMessageFeedbackProps) {
  const locked = feedback != null
  const [pedirMotivo, setPedirMotivo] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [enviando, setEnviando] = useState(false)

  const enviar = async (util: boolean, textoMotivo?: string) => {
    setEnviando(true)
    try {
      await onFeedback(messageId, util, textoMotivo)
      setPedirMotivo(false)
      setMotivo("")
    } finally {
      setEnviando(false)
    }
  }

  if (pedirMotivo && !locked) {
    return (
      <div className="mt-2 space-y-2 rounded-md border border-border/80 p-2">
        <p className="text-[11px] text-muted-foreground">
          Opcional: o que faltou na resposta?
        </p>
        <Textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Ex.: inventou prazo, ignorou o anexo…"
          className="text-xs min-h-[56px]"
          disabled={enviando}
        />
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            disabled={enviando}
            onClick={() => void enviar(false)}
          >
            Pular
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            disabled={enviando}
            onClick={() => void enviar(false, motivo.trim() || undefined)}
          >
            Enviar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 mt-2" role="group" aria-label="Avaliar resposta">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", feedback === "util" && "text-primary")}
        aria-label="Resposta útil"
        aria-pressed={feedback === "util"}
        disabled={disabled || locked || enviando}
        onClick={() => void enviar(true)}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", feedback === "nao_util" && "text-destructive")}
        aria-label="Resposta não útil"
        aria-pressed={feedback === "nao_util"}
        disabled={disabled || locked || enviando}
        onClick={() => setPedirMotivo(true)}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
