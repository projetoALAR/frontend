"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Loader2, Mail, MailX } from "lucide-react"

type EmailStatus = {
  smtpConfigured: boolean
  appUrl: string
  environment: string
}

export function EmailStatusCard() {
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void api
      .get<EmailStatus>("/sistema/email-status")
      .then(setStatus)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Falha ao carregar")
      })
  }, [])

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-2">E-mail transacional</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Usado em convites de equipe, lembretes de prazo e redefinição de senha.
        Configure SMTP_* e APP_URL no backend.
      </p>
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
              <Mail className="w-4 h-4 text-emerald-600" />
            ) : (
              <MailX className="w-4 h-4 text-amber-600" />
            )}
            <span>
              SMTP:{" "}
              <strong>
                {status.smtpConfigured ? "configurado" : "não configurado"}
              </strong>
              {!status.smtpConfigured
                ? " — convites/reset só no inbox; em dev o link de reset aparece na tela"
                : null}
            </span>
          </li>
          <li className="text-muted-foreground">
            APP_URL: <code className="text-foreground">{status.appUrl}</code>
          </li>
          <li className="text-muted-foreground">
            Ambiente: {status.environment}
          </li>
        </ul>
      ) : null}
    </Card>
  )
}
