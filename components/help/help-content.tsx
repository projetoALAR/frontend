"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Video, MessageCircle, Mail, ChevronDown, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { resetOnboarding } from "@/lib/onboarding"

const FORUM_URL = process.env.NEXT_PUBLIC_FORUM_URL || "https://github.com/discussions"
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "suporte@alar.com.br"
const VIDEOS_URL =
  process.env.NEXT_PUBLIC_VIDEOS_URL ||
  "https://www.youtube.com/results?search_query=gest%C3%A3o+jur%C3%ADdica+escrit%C3%B3rio"

const helpCategories = [
  {
    id: "docs",
    icon: BookOpen,
    title: "Documentação",
    description: "Acesse nossos guias e tutoriais completos",
    color: "bg-primary",
  },
  {
    id: "videos",
    icon: Video,
    title: "Tutoriais em Vídeo",
    description: "Assista guias passo a passo em vídeo",
    color: "bg-blue-400",
  },
  {
    id: "forum",
    icon: MessageCircle,
    title: "Fórum da Comunidade",
    description: "Conecte-se com outros usuários e obtenha respostas",
    color: "bg-indigo-500",
  },
  {
    id: "support",
    icon: Mail,
    title: "Suporte",
    description: "Obtenha ajuda direta da nossa equipe de suporte",
    color: "bg-sky-500",
  },
]

const faqs = [
  {
    question: "Como criar um novo caso?",
    answer:
      "Clique no botão '+ Casos' no painel ou '+ Novo Caso' na página de Casos. Preencha título, cliente, prioridade, status e prazo. Você também pode adicionar tags para organizar melhor seus casos.",
  },
  {
    question: "Como adicionar um novo cliente?",
    answer:
      "Clique no botão '+ Cliente'. Escolha pessoa física (CPF) ou jurídica (CNPJ). Preencha nome/razão social, contato e, se quiser, endereço e observações internas.",
  },
  {
    question: "Como convidar membros da equipe?",
    answer:
      "Acesse a página Equipe e clique em '+ Adicionar Membro'. Preencha nome, e-mail e cargo. Você pode registrar e enviar e-mail pelo botão no card do membro.",
  },
  {
    question: "Como usar o filtro de datas nas tarefas?",
    answer:
      "Na página de Casos, use o botão 'Data' ou o modal 'Filtrar' com datas de vencimento. Escolha início e fim para filtrar casos com prazo nesse período.",
  },
  {
    question: "Como usar o checklist do caso?",
    answer:
      "Abra o caso e vá na aba Checklist. Adicione itens (protocolar, ligar no cliente, juntar documentos) com prazo opcional. Marque ao concluir. Assistentes também podem marcar; exclusão fica com advogado e admin.",
  },
  {
    question: "Como fazer upload de documentos?",
    answer:
      "Abra um caso pelo título ou pelo ícone de olho. Na aba Documentos, arraste arquivos para a área tracejada ou clique em Enviar. Depois você pode baixar ou excluir.",
  },
  {
    question: "Como editar um caso ou membro?",
    answer:
      "Nos casos, use o lápis para o modal de edição ou o olho para abrir a página do caso. Nos membros, use o ícone de lápis no card.",
  },
  {
    question: "Posso deletar clientes ou membros?",
    answer:
      "Sim. Use o ícone de lixeira no card do cliente ou membro e confirme. A remoção não pode ser desfeita.",
  },
  {
    question: "Como buscar clientes ou casos rapidamente?",
    answer:
      "Use Ctrl+K (ou o campo Buscar no topo) para pesquisar por nome, CPF, CNPJ, número CNJ ou título do caso. Os resultados abrem o cliente ou a página do caso.",
  },
  {
    question: "O que é a Timeline do caso?",
    answer:
      "Na página do caso, aba Timeline, você vê histórico unificado: documentos, prazos, andamentos, auditoria e comentários internos da equipe.",
  },
  {
    question: "Como registrar um andamento?",
    answer:
      "Abra o caso na aba Andamentos. Use Sincronizar para buscar movimentos do tribunal (DataJud) ou registre um andamento interno com data e descrição (protocolo, intimação, redesignação). Só a equipe exclui o que lançou à mão — o que veio do tribunal permanece.",
  },
  {
    question: "Como falar com o suporte?",
    answer:
      "Clique no card Suporte nesta página para abrir seu cliente de e-mail, ou use o e-mail configurado da equipe.",
  },
]

export function HelpContent() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCategoryClick = (id: string) => {
    if (id === "docs") {
      document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })
      return
    }
    if (id === "videos") {
      window.open(VIDEOS_URL, "_blank", "noopener,noreferrer")
      return
    }
    if (id === "forum") {
      window.open(FORUM_URL, "_blank", "noopener,noreferrer")
      return
    }
    if (id === "support") {
      window.location.href = `mailto:${SUPPORT_EMAIL}`
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar ajuda..."
          className="pl-10 h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => (
          <Card
            key={category.title}
            role="button"
            tabIndex={0}
            onClick={() => handleCategoryClick(category.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCategoryClick(category.id)
            }}
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${category.color}`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Tour de boas-vindas</h3>
            <p className="text-sm text-muted-foreground">
              Revise os passos iniciais do Alar em menos de um minuto.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (user) resetOnboarding(user.id)
            window.dispatchEvent(new CustomEvent("openOnboardingTour"))
          }}
        >
          Ver tour novamente
        </Button>
      </Card>

      <div id="faq-section" className="space-y-4 scroll-mt-6">
        <h2 className="text-xl font-semibold">Perguntas Frequentes</h2>
        {filteredFaqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum resultado para a busca.</p>
        ) : (
          filteredFaqs.map((faq, index) => (
            <Card key={faq.question} className="overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    expandedFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
