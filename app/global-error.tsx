"use client"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", padding: 32, textAlign: "center" }}>
        <h1>Algo deu errado</h1>
        <p>Não foi possível carregar o Alar. Recarregue a página.</p>
        {error?.message ? (
          <p style={{ fontSize: 12, color: "#666" }}>{error.message}</p>
        ) : null}
        <p>
          <a href="/">Voltar ao painel</a>
        </p>
      </body>
    </html>
  )
}
