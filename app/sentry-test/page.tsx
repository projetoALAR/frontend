'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

const enabled = process.env.NEXT_PUBLIC_SENTRY_ENABLE_TEST === 'true'

export default function SentryTestPage() {
  const [msg, setMsg] = useState('')

  if (!enabled) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Página de teste do Sentry desligada. Defina{' '}
          <code className="text-foreground">NEXT_PUBLIC_SENTRY_ENABLE_TEST=true</code> no{' '}
          <code className="text-foreground">.env.local</code> (só em desenvolvimento).
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Teste Sentry (frontend)</h1>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Envia um erro de teste para o projeto Sentry. Remova a flag depois de validar.
      </p>
      <Button
        onClick={() => {
          const err = new Error('Alar Frontend — erro de teste do Sentry')
          Sentry.captureException(err)
          setMsg('Erro enviado (se o DSN estiver configurado). Confira o painel Sentry.')
          throw err
        }}
      >
        Disparar erro de teste
      </Button>
      {msg ? <p className="text-sm text-primary">{msg}</p> : null}
    </main>
  )
}
