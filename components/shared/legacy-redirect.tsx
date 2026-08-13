"use client"

import { useEffect } from "react"

type LegacyRedirectProps = {
  to: string
  /** Se a query tiver `caseId`, vai para `/casos/{id}` em vez do destino. */
  caseIdToCaso?: boolean
}

export function LegacyRedirect({ to, caseIdToCaso = false }: LegacyRedirectProps) {
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (caseIdToCaso) {
      const caseId = sp.get("caseId")
      if (caseId) {
        window.location.replace(`/casos/${caseId}`)
        return
      }
      sp.delete("caseId")
    }
    const qs = sp.toString()
    window.location.replace(qs ? `${to}?${qs}` : to)
  }, [to, caseIdToCaso])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Redirecionando…</p>
    </div>
  )
}
