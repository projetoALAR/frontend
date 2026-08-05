"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  date: string
  preview: string
}

interface ChatHistoryProps {
  conversations: Conversation[]
  activeConversationId: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  className?: string
}

export function ChatHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  className,
}: ChatHistoryProps) {
  return (
    <div
      className={cn(
        "w-full lg:w-64 bg-card border-l border-border flex flex-col h-full min-h-0 shrink-0",
        className,
      )}
    >
      <div className="p-4 border-b border-border space-y-2 shrink-0">
        <p className="text-xs text-muted-foreground">
          Chat geral do workspace — sem detalhes internos dos casos
        </p>
        <Button
          onClick={onNewConversation}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conversa ainda</p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-300 group hover:bg-secondary",
                activeConversationId === conversation.id ? "bg-primary/10 border border-primary/20" : "border border-transparent"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <h3 className="text-sm font-medium text-foreground truncate">{conversation.title}</h3>
              <p className="text-xs text-muted-foreground truncate mt-1">{conversation.preview}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{conversation.date}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conversation.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
