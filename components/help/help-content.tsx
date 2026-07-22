"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Video, MessageCircle, Mail, ChevronDown } from "lucide-react"
import { useState } from "react"

const helpCategories = [
  {
    icon: BookOpen,
    title: "Documentação",
    description: "Acesse nossos guias e tutoriais completos",
    color: "bg-primary",
  },
  { icon: Video, title: "Tutoriais em Vídeo", description: "Assista guias passo a passo em vídeo", color: "bg-blue-400" },
  {
    icon: MessageCircle,
    title: "Fórum da Comunidade",
    description: "Conecte-se com outros usuários e obtenha respostas",
    color: "bg-indigo-500",
  },
  { icon: Mail, title: "Suporte", description: "Obtenha ajuda direta da nossa equipe de suporte", color: "bg-sky-500" },
]

const faqs = [
  {
    question: "Como criar um novo caso?",
    answer: "Clique no botão '+ Casos' no painel para criar um novo caso. Preencha o título, área jurídica, prioridade e data de vencimento. Você também pode adicionar classificações (tags) para organizar melhor seus casos.",
  },
  {
    question: "Como adicionar um novo cliente?",
    answer: "Acesse a página 'Clientes' no menu lateral ou clique em '+ Cliente' no dashboard. Preencha os dados do cliente como nome/razão social, email, telefone, CNPJ e endereço. Você pode gerenciar todos os clientes em um só lugar.",
  },
  {
    question: "Como convidar membros da equipe?",
    answer: "Acesse a página Equipe e clique em '+ Adicionar Membro'. Preencha o nome completo, email e selecione o cargo do membro. Os membros aparecerão na lista e você pode fazer chamadas ou enviar emails diretamente.",
  },
  {
    question: "Como usar o filtro de datas nas tarefas?",
    answer: "Na página de Casos, clique no botão 'Data' para abrir o seletor de período. Escolha uma data inicial e final para filtrar apenas os casos com vencimento nesse período. Clique em 'Limpar' para remover o filtro.",
  },
  {
    question: "Como fazer upload de documentos?",
    answer: "Abra um caso clicando no ícone de olho. Na aba 'Documentos', clique na área tracejada ou arraste arquivos para enviar. Você pode baixar ou deletar documentos depois. Suporta PDF, Word, Excel e imagens.",
  },
  {
    question: "Como editar um caso ou membro?",
    answer: "Clique no ícone de lápis (Pencil) no card do caso ou membro. Faça as alterações desejadas e clique em 'Atualizar'. As alterações são salvas automaticamente.",
  },
  {
    question: "Posso deletar clientes ou membros?",
    answer: "Sim, clique no ícone de lixeira (Trash) no card do cliente ou membro. Confirme a ação e o registro será removido. Esta ação não pode ser desfeita.",
  },
  {
    question: "Como entrar em contato com o suporte?",
    answer: "Você pode clicar nos botões de Email ou Ligar nos cards de clientes e membros para entrar em contato direto. Para questões gerais, acesse a seção de Suporte nesta página.",
  },
]

export function HelpContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Perguntas Frequentes</h3>
        {searchTerm && filteredFaqs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma pergunta encontrada para "{searchTerm}"</p>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div
                key={faq.question}
                className="border border-border rounded-lg overflow-hidden animate-slide-in-up transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary transition-colors text-left"
                >
                  <h4 className="font-medium">{faq.question}</h4>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 py-3 bg-muted/50 border-t border-border animate-slide-in-up">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
