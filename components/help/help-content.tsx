"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  BookOpen,
  Mail,
  ChevronDown,
  Sparkles,
  ListChecks,
  Briefcase,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { resetOnboarding } from "@/lib/onboarding"

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "suporte@alar.com.br"
const VIDEOS_URL = process.env.NEXT_PUBLIC_VIDEOS_URL?.trim() || ""
const FORUM_URL = process.env.NEXT_PUBLIC_FORUM_URL?.trim() || ""

const passos = [
  {
    title: "Cadastre o cliente",
    text: "Em Clientes, escolha pessoa física (CPF) ou jurídica (CNPJ). Endereço e observações são opcionais.",
  },
  {
    title: "Abra o caso",
    text: "Em Casos, informe o número CNJ, o responsável e o prazo. O título do caso vira um link para a página dele.",
  },
  {
    title: "Acompanhe o dia a dia",
    text: "Na página do caso use Checklist, Documentos, Timeline e Andamentos (sincronize o tribunal ou registre um movimento interno).",
  },
  {
    title: "Use a IA com revisão",
    text: "O chat do caso cita anexos quando encontra trecho. Rascunhos de petição exigem revisão humana. A IA não substitui o advogado.",
  },
]

const faqs = [
  {
    question: "Como criar um novo caso?",
    answer:
      "Clique em '+ Novo Caso' na página de Casos (ou '+ Casos' no painel). Preencha título, cliente, prioridade, status e prazo. Tags ajudam a organizar.",
  },
  {
    question: "Como adicionar um novo cliente?",
    answer:
      "Clique em '+ Cliente'. Escolha pessoa física (CPF) ou jurídica (CNPJ). Preencha nome/razão social, contato e, se quiser, endereço e observações internas.",
  },
  {
    question: "Como abrir a página de um caso?",
    answer:
      "Na lista de Casos, clique no título ou no ícone de olho. A URL fica /casos/... e pode ser favoritada. Busca (Ctrl+K), prazos e mensagens também abrem essa página.",
  },
  {
    question: "Como convidar membros da equipe?",
    answer:
      "Acesse Equipe (admin) e clique em '+ Adicionar Membro'. Preencha nome, e-mail e cargo. Você pode registrar e enviar e-mail pelo botão no card do membro.",
  },
  {
    question: "Como usar o filtro de datas nos casos?",
    answer:
      "Na página de Casos, use o botão 'Data' ou o modal 'Filtrar' com datas de vencimento. Escolha início e fim para filtrar casos com prazo nesse período.",
  },
  {
    question: "Como usar o checklist do caso?",
    answer:
      "Abra o caso e vá na aba Checklist. Adicione itens (protocolar, ligar no cliente, juntar documentos) com prazo opcional. Marque ao concluir. Assistentes também podem marcar; exclusão fica com advogado e admin.",
  },
  {
    question: "Como registrar um andamento?",
    answer:
      "Na aba Andamentos, use Sincronizar para buscar movimentos do tribunal (DataJud) ou registre um andamento interno com data e descrição. Só a equipe exclui o que lançou à mão — o que veio do tribunal permanece.",
  },
  {
    question: "Como fazer upload de documentos?",
    answer:
      "Na página do caso, aba Documentos, arraste arquivos para a área tracejada ou clique em Enviar. Depois você pode baixar ou excluir.",
  },
  {
    question: "Como buscar clientes ou casos rapidamente?",
    answer:
      "Use Ctrl+K (ou o campo Buscar no topo) para pesquisar por nome, CPF, CNPJ, número CNJ ou título do caso.",
  },
  {
    question: "O que é a Timeline do caso?",
    answer:
      "Na aba Timeline você vê o histórico unificado: documentos, prazos, andamentos, auditoria e comentários internos da equipe.",
  },
  {
    question: "Posso deletar clientes ou membros?",
    answer:
      "Sim. Use o ícone de lixeira no card e confirme. A remoção não pode ser desfeita. Em clientes, admin também pode anonimizar (LGPD).",
  },
  {
    question: "Como falar com o suporte?",
    answer: `Clique no card Suporte nesta página para abrir o e-mail ${SUPPORT_EMAIL}.`,
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

  const openTour = () => {
    if (user) resetOnboarding(user.id)
    window.dispatchEvent(new CustomEvent("openOnboardingTour"))
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => document.getElementById("primeiros-passos")?.scrollIntoView({ behavior: "smooth" })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              document.getElementById("primeiros-passos")?.scrollIntoView({ behavior: "smooth" })
            }
          }}
          className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-primary">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Primeiros passos</h3>
              <p className="text-sm text-muted-foreground">Cliente, caso, checklist e andamentos no Alar.</p>
            </div>
          </div>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })
            }
          }}
          className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-blue-500">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Perguntas frequentes</h3>
              <p className="text-sm text-muted-foreground">Respostas curtas sobre o que o escritório usa no dia a dia.</p>
            </div>
          </div>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={openTour}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openTour()
          }}
          className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-indigo-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Tour de boas-vindas</h3>
              <p className="text-sm text-muted-foreground">Revise os passos iniciais em menos de um minuto.</p>
            </div>
          </div>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          onClick={() => {
            window.location.href = `mailto:${SUPPORT_EMAIL}`
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              window.location.href = `mailto:${SUPPORT_EMAIL}`
            }
          }}
          className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-sky-500">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Suporte</h3>
              <p className="text-sm text-muted-foreground">Fale com a equipe em {SUPPORT_EMAIL}.</p>
            </div>
          </div>
        </Card>
      </div>

      {(VIDEOS_URL || FORUM_URL) && (
        <p className="text-xs text-muted-foreground">
          {VIDEOS_URL ? (
            <a href={VIDEOS_URL} className="underline" target="_blank" rel="noopener noreferrer">
              Vídeos
            </a>
          ) : null}
          {VIDEOS_URL && FORUM_URL ? " · " : null}
          {FORUM_URL ? (
            <a href={FORUM_URL} className="underline" target="_blank" rel="noopener noreferrer">
              Fórum
            </a>
          ) : null}
        </p>
      )}

      <div id="primeiros-passos" className="space-y-3 scroll-mt-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-muted-foreground" />
          Como usar o Alar
        </h2>
        <ol className="grid gap-3">
          {passos.map((passo, index) => (
            <Card key={passo.title} className="p-4">
              <p className="text-sm font-semibold">
                {index + 1}. {passo.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{passo.text}</p>
            </Card>
          ))}
        </ol>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold">Prefere o tour guiado?</h3>
          <p className="text-sm text-muted-foreground">Abre o mesmo passo a passo do primeiro login.</p>
        </div>
        <Button variant="outline" onClick={openTour}>
          Ver tour novamente
        </Button>
      </Card>

      <div id="faq-section" className="space-y-4 scroll-mt-6">
        <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
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
