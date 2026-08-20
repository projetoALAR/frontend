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
    text: "Na página do caso use Checklist, Documentos, Timeline, Prazos e Andamentos. Em Andamentos, Consultar CNJ mostra a base pública; Importar grava no caso. Dá para registrar intimação e baixar a capa em PDF.",
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
      "Clique em '+ Cliente'. Escolha pessoa física (CPF) ou jurídica (CNPJ). Preencha nome/razão social, contato e, se quiser, endereço e observações internas. No cadastro novo dá para preencher com um documento (IA) ou importar vários de uma vez com CSV.",
  },
  {
    question: "Como importar vários clientes de uma planilha?",
    answer:
      "Em Clientes, use Importar. Envie a planilha (.xlsx/.csv) — o Alar sugere o mapeamento e só libera Confirmar quando o obrigatório estiver mapeado. No final, o relatório filtra erros/duplicados e permite baixar os problemas em CSV. Limite: 500 linhas. Só admin e advogado.",
  },
  {
    question: "Como importar vários casos de uma planilha?",
    answer:
      "Primeiro importe os clientes. Em Casos, use Importar: mapeie número do processo e CPF, CNPJ ou Documento do cliente. Sem isso o botão de importar fica bloqueado. Relatório com filtros e CSV de problemas. Limite: 500 linhas. Só admin e advogado.",
  },
  {
    question: "A planilha do meu sistema tem nomes de colunas diferentes. E agora?",
    answer:
      "Não precisa reescrever. Ao enviar o arquivo, a tela de mapeamento mostra cada coluna do seu Excel e o campo no Alar. Ajuste o que precisar. Se CPF e CNPJ estão na mesma coluna, use 'Documento (CPF ou CNPJ)'. Linhas com problema aparecem no relatório e podem ser baixadas em CSV para corrigir.",
  },
  {
    question: "Como abrir a página de um caso?",
    answer:
      "Na lista de Casos, clique no título ou no ícone de olho. A URL fica /casos/... e pode ser favoritada. Busca (Ctrl+K), prazos e mensagens também abrem essa página.",
  },
  {
    question: "Como convidar membros da equipe?",
    answer:
      "Acesse Equipe (admin). Dá para adicionar um a um ou usar Importar: envie a planilha do escritório, mapeie Nome/E-mail/Papel e defina uma senha temporária padrão. Limite: 100 por arquivo. Cada pessoa recebe e-mail de convite e, no primeiro login, é obrigada a trocar a senha. Em Configurações → Usuários, o admin vê quem ainda tem troca pendente e pode enviar link de redefinição ou nova senha temporária.",
  },
  {
    question: "Esqueci minha senha. O que faço?",
    answer:
      "Na tela de login, use Esqueci minha senha. Informe o e-mail da conta: se existir, chega um link válido por 1 hora. Depois defina uma senha forte (mínimo 10 caracteres, com maiúscula, minúscula e número). Em desenvolvimento, se o SMTP não estiver configurado, o próprio Alar mostra o link na tela.",
  },
  {
    question: "Por que o Alar pede troca de senha no primeiro acesso?",
    answer:
      "Contas criadas ou importadas pela equipe usam senha temporária. Até trocar, só a tela de troca de senha fica liberada. Depois disso o app funciona normalmente.",
  },
  {
    question: "Como ativar o envio de e-mails (convite e reset)?",
    answer:
      "No backend, configure SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM e APP_URL (URL do front). Admin vê o status em Configurações → E-mail transacional. Sem SMTP, as mensagens aparecem só no inbox; em desenvolvimento o link de reset também aparece na tela.",
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
      "Na aba Andamentos, use Consultar CNJ para ver os movimentos na base pública e Importar para gravar no caso. Também dá para registrar um andamento interno. Só a equipe exclui o que lançou à mão — o que veio do tribunal permanece.",
  },
  {
    question: "Como registrar uma intimação ou prazo?",
    answer:
      "Abra o caso na aba Prazos. Ali ficam o prazo principal, compromissos e tarefas com data. Use Registrar intimação para lançar o andamento e, se quiser, um compromisso de lembrete.",
  },
  {
    question: "Como baixar a capa do processo?",
    answer:
      "No cabeçalho do caso, clique no ícone de download ao lado do lápis. O PDF traz número CNJ, cliente, responsáveis, prazo e os próximos compromissos/tarefas.",
  },
  {
    question: "Como exportar um relatório de casos?",
    answer:
      "Em Relatórios (admin), use filtros ou atalhos de prazo (hoje, 7 dias, vencidos…). O resumo mostra contagens por status e responsável. Exportar CSV ou PDF usa o mesmo recorte; o PDF limita a 500 linhas.",
  },
  {
    question: "Como ativar a autenticação em dois fatores?",
    answer:
      "Em Configurações, administrador e advogado veem o card de 2FA. Escaneie o QR no autenticador, confirme o código e guarde os de recuperação. No próximo login o código será pedido.",
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
              <p className="text-sm text-muted-foreground">Cliente, caso, prazos, capa PDF e andamentos no Alar.</p>
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
