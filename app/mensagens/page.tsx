"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCallback, useEffect, useState } from "react"
import { inboxApi, type InboxItemApi } from "@/lib/inbox-api"
import { formatDatePt } from "@/lib/format"
import { ExternalLink, Inbox, MailOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { ListSkeleton } from "@/components/shared/list-skeleton"

function rotuloTipo(tipo: string): string {
  if (tipo === "prazo-lembrete") return "Prazo"
  if (tipo === "sistema") return "Sistema"
  if (tipo === "reminders") return "Lembrete"
  if (tipo === "teamUpdates") return "Equipe"
  return tipo
}

export default function MensagensPage() {
  const [items, setItems] = useState<InboxItemApi[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await inboxApi.listar())
    } catch (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const marcarTodas = async () => {
    await inboxApi.marcarTodas()
    setItems((prev) => prev.map((i) => ({ ...i, lida: true })))
  }

  const abrirItem = async (item: InboxItemApi) => {
    try {
      await inboxApi.marcarLida(item.id)
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, lida: true } : i)),
      )
    } catch {
      // ainda tenta navegar
    }
    if (item.link) router.push(item.link)
  }

  return (
    <AppShell>
      <Header
        title="Mensagens"
        description="Alertas e lembretes. Clique para abrir o caso ou a agenda quando houver link."
        actions={
          <Button variant="outline" onClick={() => void marcarTodas()}>
            <MailOpen className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        }
      />

      <div className="mt-6 space-y-3 max-w-3xl">
        {loading ? (
          <ListSkeleton variant="rows" count={4} />
        ) : items.length === 0 ? (
          <ListEmptyState
            icon={Inbox}
            title="Nenhuma mensagem"
            description="Lembretes de prazo e avisos do sistema aparecem aqui."
          />
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`${item.lida ? "" : "Nova. "}${rotuloTipo(item.tipo)}: ${item.titulo}`}
              className={`p-4 transition-colors ${!item.lida ? "border-primary/40 bg-secondary/30" : ""} ${item.link ? "cursor-pointer hover:bg-secondary/50" : "cursor-default"}`}
              onClick={() => void abrirItem(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  void abrirItem(item)
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.titulo}</p>
                    <Badge variant="outline" className="text-xs font-normal">
                      {rotuloTipo(item.tipo)}
                    </Badge>
                    {!item.lida ? (
                      <Badge variant="secondary" className="text-xs">
                        Nova
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.corpo}</p>
                  {item.link ? (
                    <p className="text-xs text-primary inline-flex items-center gap-1 pt-1">
                      Abrir destino
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDatePt(item.criadoEm)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  )
}
