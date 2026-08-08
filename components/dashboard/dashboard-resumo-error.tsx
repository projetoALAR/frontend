"use client"

import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type DashboardResumoErrorProps = {
  message: string
  onRetry: () => void
  loading?: boolean
  className?: string
}

export function DashboardResumoError({
  message,
  onRetry,
  loading = false,
  className,
}: DashboardResumoErrorProps) {
  return (
    <div
      className={
        className ??
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center"
      }
      role="alert"
    >
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Tentando...
          </>
        ) : (
          "Tentar novamente"
        )}
      </Button>
    </div>
  )
}
