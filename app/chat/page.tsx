"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatHistory } from "@/components/chat/chat-history"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  date: string
  preview: string
  messages: Message[]
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Dúvida sobre Contrato",
      date: "Hoje",
      preview: "Como validar um contrato comercial?",
      messages: [
        {
          id: "1",
          content: "Como validar um contrato comercial?",
          isUser: true,
          timestamp: "14:30",
        },
        {
          id: "2",
          content:
            "Um contrato comercial é válido quando possui os elementos essenciais: partes capazes, objeto lícito e forma prescrita em lei. Recomendo revisar com um especialista em direito contratual.",
          isUser: false,
          timestamp: "14:31",
        },
      ],
    },
    {
      id: "2",
      title: "Processo Trabalhista",
      date: "Ontem",
      preview: "Qual é o prazo para contestação?",
      messages: [],
    },
    {
      id: "3",
      title: "Direito Civil",
      date: "2 dias atrás",
      preview: "Como funciona a sucessão testamentária?",
      messages: [],
    },
  ])

  const [activeConversationId, setActiveConversationId] = useState("1")

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const [messages, setMessages] = useState<Message[]>(activeConversation?.messages || [])

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: !messages[messages.length - 1]?.isUser || messages.length === 0,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)

    // Atualizar conversa ativa
    setConversations(
      conversations.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: updatedMessages,
              preview: newMessage.content.slice(0, 40) + "...",
            }
          : conv
      )
    )
  }

  const handleNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: "Nova Conversa",
      date: "Agora",
      preview: "Comece digitando...",
      messages: [],
    }
    setConversations([newConversation, ...conversations])
    setActiveConversationId(newId)
    setMessages([])
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    const conversation = conversations.find((c) => c.id === id)
    setMessages(conversation?.messages || [])
  }

  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter((c) => c.id !== id)
    setConversations(updatedConversations)

    if (activeConversationId === id) {
      const nextConversation = updatedConversations[0]
      if (nextConversation) {
        setActiveConversationId(nextConversation.id)
        setMessages(nextConversation.messages)
      } else {
        setActiveConversationId("")
        setMessages([])
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex lg:ml-64">
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
        <ChatHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </main>
    </div>
  )
}
