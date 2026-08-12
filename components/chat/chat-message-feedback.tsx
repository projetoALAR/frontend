"use client"

import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatMessageFeedbackProps = {
  messageId: string
  feedback?: "util" | "nao_util" | null
  onFeedback: (messageId: string, util: boolean) => void | Promise<void>
  disabled?: boolean
}

export function ChatMessageFeedback({
  messageId,
  feedback,
  onFeedback,
  disabled = false,
}: ChatMessageFeedbackProps) {
  const locked = feedback != null

  return (
    <div className="flex items-center gap-0.5 mt-2" role="group" aria-label="Avaliar resposta">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", feedback === "util" && "text-primary")}
        aria-label="Resposta útil"
        aria-pressed={feedback === "util"}
        disabled={disabled || locked}
        onClick={() => void onFeedback(messageId, true)}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", feedback === "nao_util" && "text-destructive")}
        aria-label="Resposta não útil"
        aria-pressed={feedback === "nao_util"}
        disabled={disabled || locked}
        onClick={() => void onFeedback(messageId, false)}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
