"use client"

import { useEffect } from "react"

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const detalhe = error.message && !error.message.includes("Server Components")
    ? error.message
    : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center bg-background">
      <h1 className="text-xl font-semibold text-foreground">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Recarregue a página. Se não resolver, volte ao painel.
      </p>
      {detalhe ? (
        <p className="text-xs text-muted-foreground max-w-md break-words font-mono">{detalhe}</p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm"
          onClick={() => window.location.reload()}
        >
          Recarregar
        </button>
        <button
          type="button"
          className="h-10 px-4 rounded-md border border-border text-sm"
          onClick={() => {
            window.location.href = "/"
          }}
        >
          Ir ao painel
        </button>
      </div>
    </div>
  )
}
