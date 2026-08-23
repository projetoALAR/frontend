"use client"

import { useState, useLayoutEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "./chat-message"
import { AiDisclaimer } from "@/components/ai-disclaimer"
import { Send } from "lucide-react"
import { ChatExportButton } from "./chat-export-button"
import { abrirDocumentoEmNovaAba } from "@/lib/documentos-api"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  fontes?: import("@/lib/chat-api").ChatFonteApi[] | null
  feedback?: "util" | "nao_util" | null
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => Promise<void>
  onFeedback?: (
    messageId: string,
    util: boolean,
    motivo?: string,
  ) => void | Promise<void>
  onOpenDocumento?: (documentoId: string, nome: string) => void
  conversacaoId?: string
  quota?: { usados: number; limite: number; restantes: number } | null
  isLoading?: boolean
}

export function ChatInterface({
  messages,
  onSendMessage,
  onFeedback,
  onOpenDocumento,
  conversacaoId,
  quota,
  isLoading = false,
}: ChatInterfaceProps) {
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)
  const loadingListEmpty = isLoading && messages.length === 0 && !isProcessing

  const abrirDocumento =
    onOpenDocumento ??
    ((documentoId: string, nome: string) => {
      void (async () => {
        try {
          await abrirDocumentoEmNovaAba(documentoId)
        } catch (error) {
          toast({
            title: `Não abriu ${nome}`,
            description: error instanceof Error ? error.message : "Falha na API",
            variant: "destructive",
          })
        }
      })()
    })

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" })
  }

  // Sempre leva ao final: instantâneo ao abrir/trocar; suave ao receber mensagem nova
  useLayoutEffect(() => {
    const grew = messages.length > prevCountRef.current
    const behavior: ScrollBehavior =
      grew && prevCountRef.current > 0 ? "smooth" : "auto"
    scrollToBottom(behavior)
    // segunda passagem após layout assíncrono
    const t = window.setTimeout(() => scrollToBottom(behavior), 50)
    prevCountRef.current = messages.length
    return () => window.clearTimeout(t)
  }, [messages, isProcessing, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return
    setIsProcessing(true)
    const userMessage = inputValue
    setInputValue("")
    try {
      await onSendMessage(userMessage)
    } catch {
      // Restaura o texto se o envio falhar (ex.: IA indisponível)
      setInputValue(userMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0 min-w-0 h-full">
      <div className="border-b border-border p-3 sm:p-4 bg-card shrink-0 hidden md:block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Chat com IA Jurídica</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Assistente para apoio em questões jurídicas — não substitui advogado
              {quota ? (
                <span className="block mt-1">
                  Uso hoje: {quota.usados.toLocaleString("pt-BR")} / {quota.limite.toLocaleString("pt-BR")} tokens
                </span>
              ) : null}
            </p>
          </div>
          {conversacaoId && messages.length > 0 ? (
            <ChatExportButton conversacaoId={conversacaoId} />
          ) : null}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {loadingListEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
            </div>
            <p className="text-sm">Carregando conversas...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Comece uma conversa</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Faça perguntas sobre direito, contratos e processos. Confira sempre o resultado com um
              advogado habilitado.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                messageId={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
                fontes={message.fontes}
                feedback={message.feedback}
                onFeedback={onFeedback}
                onOpenDocumento={(id, nome) => void abrirDocumento(id, nome)}
              />
            ))}
            {(isProcessing || isLoading) && (
              <div className="flex gap-3 justify-start">
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-4 bg-card shrink-0 space-y-3">
        <AiDisclaimer compact />
        <div className="flex gap-3">
          <Input
            placeholder="Digite sua pergunta jurídica..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && !isProcessing) {
                e.preventDefault()
                void handleSendMessage()
              }
            }}
            disabled={isProcessing}
            className="flex-1 bg-background"
          />
          <Button
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={!inputValue.trim() || isProcessing}
            aria-label="Enviar mensagem"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
