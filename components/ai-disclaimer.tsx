import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export const AI_DISCLAIMER =
  "A IA do Alar não substitui a análise de um advogado habilitado. Revise sempre as respostas e rascunhos antes de usar."

type AiDisclaimerProps = {
  className?: string
  compact?: boolean
  children?: ReactNode
}

export function AiDisclaimer({ className, compact = false, children }: AiDisclaimerProps) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-lg border border-amber-500/40 bg-amber-500/10 flex gap-2 text-amber-950 dark:text-amber-100",
        compact ? "p-2.5 text-xs leading-relaxed" : "p-3 text-sm leading-relaxed",
        className,
      )}
    >
      <AlertTriangle
        className={cn(
          "shrink-0 text-amber-600 dark:text-amber-400",
          compact ? "h-3.5 w-3.5 mt-0.5" : "h-4 w-4 mt-0.5",
        )}
        aria-hidden
      />
      <p>{children ?? AI_DISCLAIMER}</p>
    </div>
  )
}
