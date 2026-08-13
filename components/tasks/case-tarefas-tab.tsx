"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ListTodo, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDatePt } from "@/lib/format"
import { tarefasApi, type ProcessoTarefaApi } from "@/lib/tarefas-api"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { cn } from "@/lib/utils"

type CaseTarefasTabProps = {
  processoId: string | null
  active: boolean
  canWrite: boolean
  canDelete: boolean
}

export function CaseTarefasTab({
  processoId,
  active,
  canWrite,
  canDelete,
}: CaseTarefasTabProps) {
  const { toast } = useToast()
  const [tarefas, setTarefas] = useState<ProcessoTarefaApi[]>([])
  const [loading, setLoading] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [prazo, setPrazo] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!processoId) return
    setLoading(true)
    try {
      setTarefas(await tarefasApi.listar(processoId))
    } catch (error) {
      setTarefas([])
      toast({
        title: "Falha ao carregar checklist",
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

  const progresso = useMemo(() => {
    const total = tarefas.length
    const feitas = tarefas.filter((t) => t.concluida).length
    return { total, feitas, pendentes: total - feitas }
  }, [tarefas])

  const handleCriar = async () => {
    if (!processoId) return
    const texto = titulo.trim()
    if (!texto) return
    setEnviando(true)
    try {
      const criada = await tarefasApi.criar(processoId, {
        titulo: texto,
        prazo: prazo ? new Date(`${prazo}T12:00:00`).toISOString() : null,
      })
      setTarefas((atual) => [...atual, criada])
      setTitulo("")
      setPrazo("")
    } catch (error) {
      toast({
        title: "Não foi possível adicionar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleToggle = async (tarefa: ProcessoTarefaApi) => {
    if (!processoId) return
    setBusyId(tarefa.id)
    const proximo = !tarefa.concluida
    setTarefas((atual) =>
      atual.map((t) => (t.id === tarefa.id ? { ...t, concluida: proximo } : t)),
    )
    try {
      const atualizada = await tarefasApi.atualizar(processoId, tarefa.id, {
        concluida: proximo,
      })
      setTarefas((atual) => atual.map((t) => (t.id === atualizada.id ? atualizada : t)))
    } catch (error) {
      setTarefas((atual) =>
        atual.map((t) => (t.id === tarefa.id ? { ...t, concluida: tarefa.concluida } : t)),
      )
      toast({
        title: "Não foi possível atualizar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setBusyId(null)
    }
  }

  const handleRemover = async (tarefa: ProcessoTarefaApi) => {
    if (!processoId) return
    setBusyId(tarefa.id)
    try {
      await tarefasApi.remover(processoId, tarefa.id)
      setTarefas((atual) => atual.filter((t) => t.id !== tarefa.id))
    } catch (error) {
      toast({
        title: "Não foi possível excluir",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          Checklist
        </h4>
        {progresso.total > 0 ? (
          <Badge variant="secondary" className="text-xs">
            {progresso.feitas}/{progresso.total}
          </Badge>
        ) : null}
      </div>

      {canWrite ? (
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void handleCriar()
          }}
        >
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Protocolar petição, ligar no cliente..."
            maxLength={200}
            disabled={!processoId || enviando}
            className="flex-1"
          />
          <Input
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            disabled={!processoId || enviando}
            className="sm:w-40"
            aria-label="Prazo da tarefa"
          />
          <Button
            type="submit"
            size="sm"
            className="min-h-10 shrink-0"
            disabled={!processoId || enviando || !titulo.trim()}
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Adicionar
          </Button>
        </form>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : tarefas.length === 0 ? (
        <ListEmptyState
          icon={ListTodo}
          title="Nenhuma tarefa neste caso"
          description="Monte o checklist do que falta: protocolo, contato com o cliente, juntada de documentos."
        />
      ) : (
        <ul className="space-y-2">
          {tarefas.map((tarefa) => (
            <li
              key={tarefa.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3"
            >
              <Checkbox
                checked={tarefa.concluida}
                disabled={busyId === tarefa.id}
                onCheckedChange={() => void handleToggle(tarefa)}
                className="mt-0.5"
                aria-label={tarefa.concluida ? "Marcar como pendente" : "Marcar como concluída"}
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p
                  className={cn(
                    "text-sm",
                    tarefa.concluida && "line-through text-muted-foreground",
                  )}
                >
                  {tarefa.titulo}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tarefa.prazo ? `Prazo ${formatDatePt(tarefa.prazo)}` : "Sem prazo"}
                  {tarefa.criadoPor ? ` · ${tarefa.criadoPor.nome}` : ""}
                </p>
              </div>
              {canDelete ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 min-h-9 min-w-9 text-muted-foreground hover:text-destructive"
                  aria-label={`Excluir ${tarefa.titulo}`}
                  disabled={busyId === tarefa.id}
                  onClick={() => void handleRemover(tarefa)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
