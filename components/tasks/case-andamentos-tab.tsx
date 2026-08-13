"use client"

import { useCallback, useEffect, useState } from "react"
import { History, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MaskedInput } from "@/components/ui/masked-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDatePt } from "@/lib/format"
import { andamentosApi, type AndamentoApi } from "@/lib/andamentos-api"

type CaseAndamentosTabProps = {
  processoId: string | null
  active: boolean
  canWriteCnj: boolean
  canCreate: boolean
  canDelete: boolean
  cnjDraft: string
  onCnjChange: (value: string) => void
  onSaveCnj: () => Promise<void> | void
  savingCnj: boolean
  cnjDirty: boolean
}

function hojeIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function CaseAndamentosTab({
  processoId,
  active,
  canWriteCnj,
  canCreate,
  canDelete,
  cnjDraft,
  onCnjChange,
  onSaveCnj,
  savingCnj,
  cnjDirty,
}: CaseAndamentosTabProps) {
  const { toast } = useToast()
  const [andamentos, setAndamentos] = useState<AndamentoApi[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState(hojeIsoDate)

  const carregar = useCallback(async () => {
    if (!processoId) return
    setLoading(true)
    try {
      setAndamentos(await andamentosApi.listarPorProcesso(processoId))
    } catch {
      setAndamentos([])
    } finally {
      setLoading(false)
    }
  }, [processoId])

  useEffect(() => {
    if (active && processoId) {
      void carregar()
    }
  }, [active, processoId, carregar])

  const handleSync = async () => {
    if (!processoId) return
    if (cnjDirty) {
      toast({
        title: "Salve o número CNJ",
        description: "Há alterações não salvas no número do processo.",
        variant: "destructive",
      })
      return
    }
    setSyncing(true)
    try {
      const resultado = await andamentosApi.sincronizar(processoId)
      await carregar()
      if (resultado.inseridos > 0) {
        toast({
          title: "Andamentos sincronizados",
          description: `${resultado.inseridos} novo(s) andamento(s) encontrado(s).`,
        })
      } else if (resultado.motivo) {
        toast({
          title: "Nenhum andamento novo",
          description: resultado.motivo,
        })
      } else {
        toast({
          title: "Sincronização concluída",
          description: "Nenhum andamento novo desde a última consulta.",
        })
      }
    } catch (error) {
      toast({
        title: "Falha ao sincronizar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleCriar = async () => {
    if (!processoId) return
    const texto = descricao.trim()
    if (!texto) return
    setEnviando(true)
    try {
      const criado = await andamentosApi.criarManual(processoId, {
        descricao: texto,
        data: data || undefined,
      })
      setAndamentos((atual) => [criado, ...atual])
      setDescricao("")
      setData(hojeIsoDate())
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

  const handleRemover = async (item: AndamentoApi) => {
    if (!processoId) return
    setBusyId(item.id)
    try {
      await andamentosApi.remover(processoId, item.id)
      setAndamentos((atual) => atual.filter((a) => a.id !== item.id))
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          Andamentos
        </h4>
        <Button
          size="sm"
          variant="outline"
          disabled={syncing || savingCnj || !processoId}
          onClick={() => void handleSync()}
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1" />
          )}
          Sincronizar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground rounded-md border border-border bg-secondary/40 px-3 py-2">
        A sincronização consulta a base pública do CNJ (DataJud). Não há garantia de completude nem de atualização em tempo real — registre o andamento interno quando o tribunal atrasar ou o movimento não aparecer.
      </p>

      <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="cnj-numero">Número CNJ</Label>
          <div className="flex gap-2">
            <MaskedInput
              id="cnj-numero"
              mask="processo"
              value={cnjDraft}
              onValueChange={onCnjChange}
              placeholder="0001234-56.2024.8.26.0100"
              className="font-mono text-sm"
              disabled={!canWriteCnj || savingCnj}
            />
            {canWriteCnj && (
              <Button
                size="sm"
                className="shrink-0"
                disabled={savingCnj || !cnjDirty}
                onClick={() => void onSaveCnj()}
              >
                {savingCnj ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Consulta pública do CNJ (DataJud). Sem garantia de completude; não substitui o andamento interno do escritório.
          </p>
        </div>
      </section>

      {canCreate && (
        <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
          <p className="text-sm font-medium">Registrar andamento interno</p>
          <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="andamento-data">Data</Label>
              <Input
                id="andamento-data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={!processoId || enviando}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="andamento-descricao">Descrição</Label>
              <Textarea
                id="andamento-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: Petição protocolada, intimação recebida, audiência redesignada..."
                className="min-h-[72px]"
                disabled={!processoId || enviando}
              />
            </div>
          </div>
          <Button
            size="sm"
            disabled={!processoId || enviando || !descricao.trim()}
            onClick={() => void handleCriar()}
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Registrar
          </Button>
        </section>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : andamentos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum andamento ainda. Sincronize o tribunal ou registre um movimento interno.
        </p>
      ) : (
        <ol className="relative space-y-0 border-l border-border ml-2">
          {andamentos.map((item) => (
            <li key={item.id} className="relative pl-6 pb-4 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
              <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs text-muted-foreground">{formatDatePt(item.data)}</p>
                      <Badge variant={item.manual ? "secondary" : "outline"} className="text-[10px]">
                        {item.manual ? "Interno" : "Tribunal"}
                      </Badge>
                    </div>
                    <p className="text-sm">{item.descricao}</p>
                    {item.explicacao ? (
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.explicacao}</p>
                    ) : null}
                  </div>
                  {canDelete && item.manual ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-destructive min-h-9 min-w-9"
                      aria-label="Excluir andamento interno"
                      disabled={busyId === item.id}
                      onClick={() => void handleRemover(item)}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
