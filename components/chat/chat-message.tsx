import { cn } from "@/lib/utils"
import { ChatCitations } from "./chat-citations"
import type { ChatFonteApi } from "@/lib/chat-api"

interface ChatMessageProps {
  content: string
  isUser: boolean
  timestamp?: string
  fontes?: ChatFonteApi[] | null
}

export function ChatMessage({ content, isUser, timestamp, fontes }: ChatMessageProps) {
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
        {!isUser && fontes && fontes.length > 0 ? (
          <ChatCitations fontes={fontes} compact />
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
