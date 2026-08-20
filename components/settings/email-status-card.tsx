"use client"

import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ExternalLink, Loader2, Mail, MailX } from "lucide-react"

type EmailStatus = {
  smtpConfigured: boolean
  smtpHost: string | null
  appUrl: string
  environment: string
  dicaLocal: string
}

type EmailTesteResultado = {
  sent?: boolean
  queuedInboxOnly?: boolean
  skipped?: boolean
  etherealPreviewUrl?: string
  para: string
}

export function EmailStatusCard() {
  const { toast } = useToast()
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [ultimoTeste, setUltimoTeste] = useState<EmailTesteResultado | null>(null)

  const carregar = useCallback(() => {
    setError(null)
    void api
      .get<EmailStatus>("/sistema/email-status")
      .then(setStatus)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Falha ao carregar")
      })
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const enviarTeste = async () => {
    setTesting(true)
    setUltimoTeste(null)
    try {
      const resultado = await api.post<EmailTesteResultado>("/sistema/email-teste")
      setUltimoTeste(resultado)
      if (resultado.sent) {
        toast({
          title: "E-mail de teste enviado",
          description: resultado.etherealPreviewUrl
            ? "Abra o preview Ethereal abaixo."
            : `Enviado para ${resultado.para}`,
        })
      } else if (resultado.queuedInboxOnly) {
        toast({
          title: "SMTP ainda não configurado",
          description: "Rode npm run smtp:ethereal no backend e cole no .env.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Falha no envio",
          description: "Confira host/usuário/senha SMTP e os logs da API.",
          variant: "destructive",
        })
      }
      carregar()
    } catch (err) {
      toast({
        title: "Erro ao testar e-mail",
        description: err instanceof Error ? err.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">E-mail transacional</h3>
        <p className="text-sm text-muted-foreground">
          Convites, reset de senha e lembretes de prazo. Em local você pode usar Ethereal
          (grátis) sem cartão.
        </p>
      </div>

      {!status && !error ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verificando…
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {status ? (
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            {status.smtpConfigured ? (
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <MailX className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>
              SMTP:{" "}
              <strong>
                {status.smtpConfigured ? "configurado" : "não configurado"}
              </strong>
              {status.smtpHost ? (
                <span className="text-muted-foreground"> ({status.smtpHost})</span>
              ) : null}
              {!status.smtpConfigured
                ? " — convites/reset só no inbox; em dev o link de reset aparece na tela"
                : null}
            </span>
          </li>
          <li className="text-muted-foreground">
            APP_URL: <code className="text-foreground">{status.appUrl}</code>
          </li>
          <li className="text-muted-foreground">Ambiente: {status.environment}</li>
          <li className="text-muted-foreground text-xs leading-relaxed pt-1">
            {status.dicaLocal}
          </li>
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={testing || !status}
          onClick={() => void enviarTeste()}
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando…
            </>
          ) : (
            "Enviar e-mail de teste"
          )}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={carregar}>
          Atualizar status
        </Button>
      </div>

      {ultimoTeste?.etherealPreviewUrl ? (
        <p className="text-sm">
          <a
            href={ultimoTeste.etherealPreviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
          >
            Abrir mensagem no Ethereal
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </p>
      ) : null}
    </Card>
  )
}
