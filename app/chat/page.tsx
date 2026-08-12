"use client"

import { useCallback, useEffect, useState } from "react"
import { History } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatHistory } from "@/components/chat/chat-history"
import { chatApi, type ConversacaoApi, type MensagemApi } from "@/lib/chat-api"
import { useToast } from "@/hooks/use-toast"
import { formatDatePt } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type UiMessage = {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  fontes?: MensagemApi["fontes"]
}

type UiConversation = {
  id: string
  title: string
  date: string
  preview: string
  messages: UiMessage[]
}

function mapMessage(m: MensagemApi): UiMessage {
  return {
    id: m.id,
    content: m.conteudo,
    isUser: m.isUser,
    fontes: m.fontes,
    timestamp: new Date(m.criadoEm).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

function mapConversation(c: ConversacaoApi): UiConversation {
  const last = c.mensagens?.[0]
  return {
    id: c.id,
    title: c.titulo,
    date: formatDatePt(c.atualizadoEm),
    preview: last?.conteudo?.slice(0, 40) || "Sem mensagens",
    messages: (c.mensagens ?? []).map(mapMessage),
  }
}

export default function ChatPage() {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<UiConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState("")
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [sending, setSending] = useState(false)

  const loadConversations = useCallback(async () => {
    setLoadingList(true)
    try {
      const list = await chatApi.listarConversas()
      const mapped = list.map(mapConversation)
      setConversations(mapped)
      if (!activeConversationId && mapped[0]) {
        setActiveConversationId(mapped[0].id)
        const full = await chatApi.obterConversa(mapped[0].id)
        setMessages((full.mensagens ?? []).map(mapMessage))
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar chat",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setLoadingList(false)
    }
  }, [activeConversationId, toast])

  useEffect(() => {
    void loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSendMessage = async (content: string) => {
    setSending(true)
    try {
      let conversaId = activeConversationId
      if (!conversaId) {
        const created = await chatApi.criarConversa({ titulo: content.slice(0, 60) })
        conversaId = created.id
        setActiveConversationId(conversaId)
        setConversations((prev) => [mapConversation(created), ...prev])
      }

      const { mensagemUsuario, mensagemIa } = await chatApi.enviarMensagem(conversaId, content)
      const mapped = [mapMessage(mensagemUsuario), mapMessage(mensagemIa)]
      setMessages((prev) => [...prev, ...mapped])
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversaId
            ? {
                ...c,
                title: c.title === "Nova conversa" ? content.slice(0, 60) : c.title,
                preview: content.slice(0, 40),
                date: "Agora",
              }
            : c,
        ),
      )
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
      throw error
    } finally {
      setSending(false)
    }
  }

  const handleNewConversation = async () => {
    try {
      const created = await chatApi.criarConversa({ titulo: "Nova conversa" })
      const mapped = mapConversation(created)
      setConversations((prev) => [mapped, ...prev])
      setActiveConversationId(created.id)
      setMessages([])
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id)
    try {
      const full = await chatApi.obterConversa(id)
      setMessages((full.mensagens ?? []).map(mapMessage))
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatApi.remover(id)
      const updated = conversations.filter((c) => c.id !== id)
      setConversations(updated)
      if (activeConversationId === id) {
        const next = updated[0]
        if (next) {
          setActiveConversationId(next.id)
          const full = await chatApi.obterConversa(next.id)
          setMessages((full.mensagens ?? []).map(mapMessage))
        } else {
          setActiveConversationId("")
          setMessages([])
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const historyProps = {
    conversations,
    activeConversationId,
    onSelectConversation: (id: string) => void handleSelectConversation(id),
    onNewConversation: () => void handleNewConversation(),
    onDeleteConversation: (id: string) => void handleDeleteConversation(id),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col md:flex-row md:ml-64 h-[100dvh] min-h-0 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-2 py-2 bg-card shrink-0 md:hidden">
          <MobileNav />
          <span className="text-sm font-semibold text-foreground flex-1 truncate">Chat IA</span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                <History className="w-4 h-4" />
                Conversas
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80 max-w-[90vw]">
              <SheetTitle className="sr-only">Histórico de conversas</SheetTitle>
              <ChatHistory {...historyProps} className="border-l-0" />
            </SheetContent>
          </Sheet>
        </div>
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={loadingList || sending}
        />
        <div className="hidden md:flex h-full min-h-0 shrink-0">
          <ChatHistory {...historyProps} />
        </div>
      </main>
    </div>
  )
}
