"use client"

import { FileText, ImageIcon, File } from "lucide-react"
import type { ChatFonteApi } from "@/lib/chat-api"

type ChatCitationsProps = {
  fontes: ChatFonteApi[]
  compact?: boolean
}

function iconFor(tipo: ChatFonteApi["tipo"]) {
  if (tipo === "imagem") return ImageIcon
  if (tipo === "pdf" || tipo === "texto") return FileText
  return File
}

export function ChatCitations({ fontes, compact }: ChatCitationsProps) {
  if (!fontes?.length) return null

  return (
    <div
      className={`mt-2 rounded-md border border-border/80 bg-background/80 ${
        compact ? "p-2" : "p-3"
      } space-y-2`}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
        Fontes consultadas
      </p>
      <ul className="space-y-2">
        {fontes.map((fonte) => {
          const Icon = iconFor(fonte.tipo)
          return (
            <li key={fonte.documentoId} className="text-xs">
              <div className="flex items-start gap-1.5">
                <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{fonte.nome}</p>
                  {fonte.trecho ? (
                    <p className="text-muted-foreground mt-0.5 leading-relaxed line-clamp-3">
                      “{fonte.trecho}”
                    </p>
                  ) : (
                    <p className="text-muted-foreground mt-0.5 italic">
                      {fonte.tipo === "imagem"
                        ? "Análise visual do arquivo."
                        : "Arquivo referenciado (sem trecho textual extraído)."}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
