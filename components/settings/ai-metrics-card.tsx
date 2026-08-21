"use client"

import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { chatApi, type ChatMetricasApi } from "@/lib/chat-api"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Loader2, RefreshCw } from "lucide-react"

export function AiMetricsCard() {
  const { toast } = useToast()
  const [metricas, setMetricas] = useState<ChatMetricasApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregar = useCallback(() => {
    setLoading(true)
    setError(null)
    void chatApi
      .metricas()
      .then(setMetricas)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Falha ao carregar"
        setError(msg)
        toast({
          title: "Erro ao carregar métricas de IA",
          description: msg,
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    carregar()
  }, [carregar])

  const totalFeedback =
    (metricas?.feedbackUtil ?? 0) + (metricas?.feedbackNaoUtil ?? 0)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Uso da IA (hoje)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tokens, mensagens e feedbacks do dia ({metricas?.dia ?? "—"})
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={carregar}
          disabled={loading}
          aria-label="Atualizar métricas"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && !metricas ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : loading && !metricas ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : metricas ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Tokens</p>
              <p className="text-xl font-semibold tabular-nums">
                {metricas.tokensTotal.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Mensagens IA</p>
              <p className="text-xl font-semibold tabular-nums">
                {metricas.mensagensIa}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Úteis</p>
              <p className="text-xl font-semibold tabular-nums text-primary">
                {metricas.feedbackUtil}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Não úteis</p>
              <p className="text-xl font-semibold tabular-nums">
                {metricas.feedbackNaoUtil}
              </p>
            </div>
          </div>

          {totalFeedback > 0 ? (
            <p className="text-xs text-muted-foreground">
              {Math.round((metricas.feedbackUtil / totalFeedback) * 100)}% das
              avaliações de hoje foram positivas.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ainda sem feedbacks avaliados hoje.
            </p>
          )}

          {metricas.porUsuario.length > 0 ? (
            <div>
              <p className="text-sm font-medium mb-2">Por usuário (top)</p>
              <ul className="text-sm space-y-1.5">
                {metricas.porUsuario.slice(0, 5).map((u) => (
                  <li
                    key={u.usuarioId}
                    className="flex justify-between gap-3 text-muted-foreground"
                  >
                    <span className="font-mono text-xs truncate">
                      {u.usuarioId.slice(0, 8)}…
                    </span>
                    <span className="tabular-nums shrink-0 text-foreground">
                      {u.mensagens} msg · {u.tokens.toLocaleString("pt-BR")} tok
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
