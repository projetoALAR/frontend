"use client"

import { checarSenha, PASSWORD_POLICY_HINT } from "@/lib/password-policy"
import { cn } from "@/lib/utils"

export function PasswordHints({ senha }: { senha: string }) {
  const checks = checarSenha(senha)
  if (!senha) {
    return <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
  }

  return (
    <ul className="space-y-0.5 mt-1">
      {checks.map((c) => (
        <li
          key={c.id}
          className={cn("text-xs", c.ok ? "text-emerald-600" : "text-muted-foreground")}
        >
          {c.ok ? "✓" : "○"} {c.label}
        </li>
      ))}
    </ul>
  )
}
