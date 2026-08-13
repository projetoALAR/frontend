"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Calendar, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDatePt, formatDateTimePt } from "@/lib/format"
import { tarefasApi, type ProcessoTarefaApi } from "@/lib/tarefas-api"
import { compromissosApi, type CompromissoApi, type CompromissoFormData } from "@/lib/compromissos-api"
import { andamentosApi } from "@/lib/andamentos-api"
import { EventModal } from "@/components/calendar/event-modal"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"

type CasePrazosTabProps = {
  processoId: string | null
  prazoIso: string | null
  active: boolean
  canWritePrazo: boolean
  canRegistrar: boolean
  onPrazoChange: (iso: string | null) => Promise<void> | void
}

function isoDateInput(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

function fimDoDiaIso(dateYmd: string) {
  return new Date(`${dateYmd}T18:00:00`).toISOString()
}

export function CasePrazosTab({
  processoId,
  prazoIso,
  active,
  canWritePrazo,
  canRegistrar,
  onPrazoChange,
}: CasePrazosTabProps) {
  const { toast } = useToast()
  const [tarefas, setTarefas] = useState<ProcessoTarefaApi[]>([])
  const [compromissos, setCompromissos] = useState<CompromissoApi[]>([])
  const [loading, setLoading] = useState(false)
  const [prazoDraft, setPrazoDraft] = useState("")
  const [savingPrazo, setSavingPrazo] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const [intimacaoDesc, setIntimacaoDesc] = useState("")
  const [intimacaoData, setIntimacaoData] = useState("")
  const [intimacaoPrazo, setIntimacaoPrazo] = useState("")
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    if (!processoId) return
    setLoading(true)
    try {
      const [listaTarefas, listaCompromissos] = await Promise.all([
        tarefasApi.listar(processoId),
        compromissosApi.listarPorProcesso(processoId),
      ])
      setTarefas(listaTarefas)
      setCompromissos(listaCompromissos)
    } catch {
      setTarefas([])
      setCompromissos([])
    } finally {
      setLoading(false)
    }
  }, [processoId])

  useEffect(() => {
    if (active && processoId) void carregar()
  }, [active, processoId, carregar])

  useEffect(() => {
    setPrazoDraft(isoDateInput(prazoIso))
  }, [prazoIso])

  const tarefasComPrazo = useMemo(
    () =>
      [...tarefas]
        .filter((t) => t.prazo)
        .sort((a, b) => String(a.prazo).localeCompare(String(b.prazo))),
    [tarefas],
  )

  const handleSalvarPrazo = async () => {
    setSavingPrazo(true)
    try {
      await onPrazoChange(prazoDraft ? fimDoDiaIso(prazoDraft) : null)
    } finally {
      setSavingPrazo(false)
    }
  }

  const handleSaveEvento = async (data: CompromissoFormData) => {
    const criado = await compromissosApi.criar({
      ...data,
      processoId: processoId,
    })
    setCompromissos((atual) =>
      [...atual, criado].sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
    )
    invalidateDashboardCache()
  }

  const handleIntimacao = async () => {
    if (!processoId) return
    const texto = intimacaoDesc.trim()
    if (!texto) return
    setEnviando(true)
    try {
      await andamentosApi.criarManual(processoId, {
        descricao: `Intimação recebida: ${texto}`,
        data: intimacaoData || undefined,
      })
      if (intimacaoPrazo) {
        const criado = await compromissosApi.criar({
          titulo: `Prazo — intimação`,
          descricao: texto,
          dataHora: fimDoDiaIso(intimacaoPrazo),
          processoId,
        })
        setCompromissos((atual) =>
          [...atual, criado].sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
        )
        invalidateDashboardCache()
      }
      setIntimacaoDesc("")
      setIntimacaoData("")
      setIntimacaoPrazo("")
      toast({
        title: "Intimação registrada",
        description: intimacaoPrazo
          ? "O andamento interno e o prazo na agenda foram criados."
          : "O andamento interno foi criado. Informe um prazo se quiser lembrete na agenda.",
      })
    } catch (error) {
      toast({
        title: "Não foi possível registrar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const vencido = prazoIso ? new Date(prazoIso).getTime() < Date.now() : false

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Prazo do caso
        </h4>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="prazo-caso">Data</Label>
            <Input
              id="prazo-caso"
              type="date"
              value={prazoDraft}
              onChange={(e) => setPrazoDraft(e.target.value)}
              disabled={!canWritePrazo || savingPrazo}
            />
          </div>
          {canWritePrazo && (
            <Button
              size="sm"
              disabled={savingPrazo}
              onClick={() => void handleSalvarPrazo()}
            >
              {savingPrazo ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Salvar
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {prazoIso
            ? vencido
              ? `Venceu em ${formatDatePt(prazoIso)}.`
              : `Vence em ${formatDatePt(prazoIso)}.`
            : "Nenhum prazo principal neste caso."}
        </p>
      </section>

      {canRegistrar && (
        <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            Registrar intimação
          </h4>
          <p className="text-xs text-muted-foreground">
            Grava um andamento interno. Se informar o prazo de resposta, também cria o compromisso na agenda (lembrete do sistema).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="intimacao-data">Data do recebimento</Label>
              <Input
                id="intimacao-data"
                type="date"
                value={intimacaoData}
                onChange={(e) => setIntimacaoData(e.target.value)}
                disabled={!processoId || enviando}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="intimacao-prazo">Prazo de resposta</Label>
              <Input
                id="intimacao-prazo"
                type="date"
                value={intimacaoPrazo}
                onChange={(e) => setIntimacaoPrazo(e.target.value)}
                disabled={!processoId || enviando}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="intimacao-desc">O que chegou</Label>
            <Textarea
              id="intimacao-desc"
              value={intimacaoDesc}
              onChange={(e) => setIntimacaoDesc(e.target.value)}
              placeholder="Ex.: Intimação para contestar em 15 dias"
              className="min-h-[72px]"
              disabled={!processoId || enviando}
            />
          </div>
          <Button
            size="sm"
            disabled={!processoId || enviando || !intimacaoDesc.trim()}
            onClick={() => void handleIntimacao()}
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            Registrar
          </Button>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium">Compromissos deste caso</h4>
              {canRegistrar && (
                <Button size="sm" variant="outline" disabled={!processoId} onClick={() => setEventOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agendar
                </Button>
              )}
            </div>
            {compromissos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum compromisso vinculado.</p>
            ) : (
              <ul className="space-y-2">
                {compromissos.map((item) => (
                  <li key={item.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">{item.titulo}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTimePt(item.dataHora)}</p>
                    {item.descricao ? (
                      <p className="text-xs text-muted-foreground mt-1">{item.descricao}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-2">
            <h4 className="font-medium">Tarefas com prazo</h4>
            {tarefasComPrazo.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa com data no checklist.</p>
            ) : (
              <ul className="space-y-2">
                {tarefasComPrazo.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                    <p className={`text-sm ${item.concluida ? "line-through text-muted-foreground" : ""}`}>
                      {item.titulo}
                    </p>
                    <Badge variant={item.concluida ? "secondary" : "outline"}>
                      {formatDatePt(item.prazo)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <EventModal
        isOpen={eventOpen}
        onClose={() => setEventOpen(false)}
        onSave={handleSaveEvento}
        lockedProcessoId={processoId}
      />
    </div>
  )
}
