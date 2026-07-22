import { cn } from "@/lib/utils"

interface ChatMessageProps {
  content: string
  isUser: boolean
  timestamp?: string
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
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
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && (
          <p className={cn("text-xs mt-1 opacity-70", isUser ? "text-primary-foreground" : "text-muted-foreground")}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
