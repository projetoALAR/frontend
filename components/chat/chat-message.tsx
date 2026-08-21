import { cn } from "@/lib/utils"
import { ChatCitations } from "./chat-citations"
import { ChatMessageFeedback } from "./chat-message-feedback"
import type { ChatFonteApi } from "@/lib/chat-api"

interface ChatMessageProps {
  messageId?: string
  content: string
  isUser: boolean
  timestamp?: string
  fontes?: ChatFonteApi[] | null
  /** No chat do caso: avisa quando a IA não citou anexos. */
  avisoSemFontes?: boolean
  feedback?: "util" | "nao_util" | null
  onFeedback?: (
    messageId: string,
    util: boolean,
    motivo?: string,
  ) => void | Promise<void>
  onOpenDocumento?: (documentoId: string, nome: string) => void
}

export function ChatMessage({
  messageId,
  content,
  isUser,
  timestamp,
  fontes,
  avisoSemFontes = false,
  feedback,
  onFeedback,
  onOpenDocumento,
}: ChatMessageProps) {
  const temFontes = !!(fontes && fontes.length > 0)

  return (
    <div className={cn("flex gap-3 animate-slide-in-up", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm transition-all duration-300",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary text-secondary-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {!isUser && temFontes ? (
          <ChatCitations
            fontes={fontes!}
            compact
            onOpenDocumento={onOpenDocumento}
          />
        ) : null}
        {!isUser && avisoSemFontes && !temFontes ? (
          <p className="mt-2 text-[11px] text-muted-foreground border-t border-border/60 pt-2">
            Sem fontes citadas nos anexos — confira se a resposta se baseia no
            contexto do caso.
          </p>
        ) : null}
        {!isUser && messageId && onFeedback ? (
          <ChatMessageFeedback
            messageId={messageId}
            feedback={feedback}
            onFeedback={onFeedback}
          />
        ) : null}
        {timestamp && (
          <p className={cn("text-xs mt-1 opacity-70", isUser ? "text-primary-foreground" : "text-muted-foreground")}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
