"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Briefcase,
  Calendar,
  CircleDot,
  FolderOpen,
  History,
  Loader2,
  MessageCircle,
  Send,
  ListTodo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatDatePt } from "@/lib/format"
import {
  timelineApi,
  type TimelineEvento,
  type TimelineTipo,
} from "@/lib/timeline-api"

type CaseTimelineTabProps = {
  processoId: string | null
  active: boolean
}

const tipoIcon: Record<TimelineTipo, typeof Briefcase> = {
  CASO_CRIADO: Briefcase,
  DOCUMENTO: FolderOpen,
  COMPROMISSO: Calendar,
  ANDAMENTO: History,
  AUDITORIA: CircleDot,
  COMENTARIO: MessageCircle,
  TAREFA: ListTodo,
}

const tipoLabel: Record<TimelineTipo, string> = {
  CASO_CRIADO: "Abertura",
  DOCUMENTO: "Documento",
  COMPROMISSO: "Prazo",
  ANDAMENTO: "Andamento",
  AUDITORIA: "Auditoria",
  COMENTARIO: "Comentário",
  TAREFA: "Tarefa",
}

export function CaseTimelineTab({ processoId, active }: CaseTimelineTabProps) {
  const { toast } = useToast()
  const [eventos, setEventos] = useState<TimelineEvento[]>([])
  const [loading, setLoading] = useState(false)
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    if (!processoId) return
    setLoading(true)
    try {
      const res = await timelineApi.listar(processoId)
      setEventos(res.eventos)
    } catch (error) {
      setEventos([])
      toast({
        title: "Falha ao carregar timeline",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [processoId, toast])

  useEffect(() => {
    if (active && processoId) {
      void carregar()
    }
  }, [active, processoId, carregar])

  const handleComentar = async () => {
    if (!processoId) return
    const texto = comentario.trim()
    if (!texto) return
    setEnviando(true)
    try {
      await timelineApi.comentar(processoId, texto)
      setComentario("")
      await carregar()
      toast({ title: "Comentário registrado" })
    } catch (error) {
      toast({
        title: "Falha ao comentar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          Comentário interno
        </h4>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Registre uma anotação visível à equipe do caso..."
          rows={3}
          maxLength={2000}
          disabled={!processoId || enviando}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!processoId || enviando || !comentario.trim()}
            onClick={() => void handleComentar()}
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Send className="w-4 h-4 mr-1" />
            )}
            Publicar
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : eventos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum evento na timeline ainda
        </p>
      ) : (
        <ol className="relative space-y-0 border-l border-border ml-2">
          {eventos.map((evento) => {
            const Icon = tipoIcon[evento.tipo]
            return (
              <li key={evento.id} className="relative pl-6 pb-4 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {evento.titulo}
                    </p>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                      {tipoLabel[evento.tipo]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDatePt(evento.data)}
                    {evento.autor ? ` · ${evento.autor.nome}` : ""}
                  </p>
                  {evento.descricao ? (
                    <p className="text-sm whitespace-pre-wrap">{evento.descricao}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
