"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "./chat-message"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

const IA_RESPONSES = [
  "Essa é uma excelente pergunta sobre direito. Deixe-me analisar...",
  "Em relação à sua questão, conforme a jurisprudência vigente...",
  "De acordo com a legislação brasileira, especificamente o artigo 5º da Constituição...",
  "Recomendo consultar a documentação relevante. Neste caso...",
  "Segundo minha análise, os pontos principais são:",
  "Essa questão envolve interpretação jurídica. Vou descrever os aspectos relevantes...",
]

export function ChatInterface({ messages, onSendMessage, isLoading = false }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    setIsProcessing(true)
    const userMessage = inputValue
    setInputValue("")

    // Enviar mensagem do usuário
    onSendMessage(userMessage)

    // Simular resposta da IA após 1 segundo
    setTimeout(() => {
      const randomResponse = IA_RESPONSES[Math.floor(Math.random() * IA_RESPONSES.length)]
      onSendMessage(randomResponse)
      setIsProcessing(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && !isProcessing) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <h2 className="text-lg font-semibold text-foreground">Chat com IA Jurídica</h2>
        <p className="text-xs text-muted-foreground mt-1">Assistente especializado em questões jurídicas</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Comece uma conversa</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Faça perguntas sobre direito, contratos, processos jurídicos e outras questões legais.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
            {isProcessing && (
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

      {/* Input */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex gap-3">
          <Input
            placeholder="Digite sua pergunta jurídica..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            className="flex-1 bg-background"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
