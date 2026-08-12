"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageCircle,
  FolderOpen,
  Send,
  Upload,
  User,
  Bot,
  Calendar,
  Tag,
  Briefcase,
  Download,
  Trash2,
  Pencil,
  Check,
  X,
  Plus,
  Loader2,
  Mail,
  Phone,
  Flag,
  CircleDot,
  History,
  RefreshCw,
  Sparkles,
  Clock,
} from "lucide-react"
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { CaseView } from "@/lib/processo-mapper"
import { mapProcessoToCase } from "@/lib/processo-mapper"
import { processosApi } from "@/lib/processos-api"
import { documentosApi, type DocumentoApi } from "@/lib/documentos-api"
import { andamentosApi, type AndamentoApi } from "@/lib/andamentos-api"
import { chatApi, type MensagemApi } from "@/lib/chat-api"
import { formatBytes, formatDatePt } from "@/lib/format"
import { useAuth } from "@/components/auth/auth-provider"
import { AiDisclaimer } from "@/components/ai-disclaimer"
import { ChatCitations } from "@/components/chat/chat-citations"
import { ChatMessageFeedback } from "@/components/chat/chat-message-feedback"
import { canDeleteDocumentos, canWriteClientesProcessos } from "@/lib/roles"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import {
  isProcessoStatusConcluido,
  processoStatusOptionsFor,
} from "@/lib/processo-status"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GenerateDocumentModal } from "@/components/tasks/generate-document-modal"
import { CaseTimelineTab } from "@/components/tasks/case-timeline-tab"

interface CasePanelProps {
  isOpen: boolean
  onClose: () => void
  caseData: CaseView | null
  onUpdated?: (caseData: CaseView) => void
}

export function CasePanel({ isOpen, onClose, caseData, onUpdated }: CasePanelProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)
  const canDeleteDocs = canDeleteDocumentos(user?.role)
  const [localCase, setLocalCase] = useState<CaseView | null>(caseData)
  const [messages, setMessages] = useState<MensagemApi[]>([])
  const [conversacaoId, setConversacaoId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [documents, setDocuments] = useState<DocumentoApi[]>([])
  const [andamentos, setAndamentos] = useState<AndamentoApi[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [loadingAndamentos, setLoadingAndamentos] = useState(false)
  const [syncingAndamentos, setSyncingAndamentos] = useState(false)
  const [cnjDraft, setCnjDraft] = useState("")
  const [savingCnj, setSavingCnj] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("info")

  const [editingHeader, setEditingHeader] = useState(false)
  const [headerData, setHeaderData] = useState({ title: "", priority: "", project: "", dueDate: "" })
  const [editingInfo, setEditingInfo] = useState(false)
  const [infoData, setInfoData] = useState({ project: "", priority: "", dueDate: "", completed: false })
  const [editingDescricao, setEditingDescricao] = useState(false)
  const [descricaoDraft, setDescricaoDraft] = useState("")
  const [editingTags, setEditingTags] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [gerarDocOpen, setGerarDocOpen] = useState(false)

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = chatScrollRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
        messagesEndRef.current?.scrollIntoView({ behavior, block: "end" })
      })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" })
  }, [])

  const loadDocs = useCallback(async (processoId: string) => {
    setLoadingDocs(true)
    try {
      setDocuments(await documentosApi.listarPorProcesso(processoId))
    } catch {
      setDocuments([])
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  const loadChat = useCallback(async (processoId: string) => {
    try {
      const conversa = await chatApi.porProcesso(processoId)
      setConversacaoId(conversa.id)
      setMessages(conversa.mensagens ?? [])
    } catch {
      setConversacaoId(null)
      setMessages([])
    }
  }, [])

  const loadAndamentos = useCallback(async (processoId: string) => {
    setLoadingAndamentos(true)
    try {
      setAndamentos(await andamentosApi.listarPorProcesso(processoId))
    } catch {
      setAndamentos([])
    } finally {
      setLoadingAndamentos(false)
    }
  }, [])

  const handleSaveCnj = async () => {
    if (!localCase) return
    const numero = cnjDraft.trim()
    if (!numero) {
      toast({
        title: "Número CNJ obrigatório",
        description: "Informe o número do processo no formato CNJ.",
        variant: "destructive",
      })
      return
    }
    setSavingCnj(true)
    try {
      await persistCase({ numero })
      setCnjDraft(numero)
    } finally {
      setSavingCnj(false)
    }
  }

  const handleSyncAndamentos = async () => {
    if (!localCase) return
    const numeroAtual = cnjDraft.trim()
    if (numeroAtual && numeroAtual !== localCase.numero) {
      toast({
        title: "Salve o número CNJ",
        description: "Há alterações não salvas no número do processo.",
        variant: "destructive",
      })
      return
    }
    setSyncingAndamentos(true)
    try {
      const resultado = await andamentosApi.sincronizar(localCase.id)
      await loadAndamentos(localCase.id)
      if (resultado.inseridos > 0) {
        toast({
          title: "Andamentos sincronizados",
          description: `${resultado.inseridos} novo(s) andamento(s) encontrado(s).`,
        })
      } else if (resultado.motivo) {
        toast({
          title: "Nenhum andamento novo",
          description: resultado.motivo,
        })
      } else {
        toast({
          title: "Sincronização concluída",
          description: "Nenhum andamento novo desde a última consulta.",
        })
      }
    } catch (error) {
      toast({
        title: "Falha ao sincronizar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSyncingAndamentos(false)
    }
  }

  // Scroll só funciona com a aba Chat visível (antes falhava com a aba Info aberta)
  useLayoutEffect(() => {
    if (activeTab !== "chat") return
    scrollChatToBottom("auto")
    const t1 = window.setTimeout(() => scrollChatToBottom("auto"), 50)
    const t2 = window.setTimeout(() => scrollChatToBottom("auto"), 200)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [activeTab, messages, isTyping, scrollChatToBottom])

  useEffect(() => {
    if (isOpen && caseData) {
      setLocalCase(caseData)
      setActiveTab("info")
      setHeaderData({
        title: caseData.title || "",
        priority: caseData.priority || "Média",
        project: caseData.project || "",
        dueDate: caseData.dueDateIso ? caseData.dueDateIso.slice(0, 10) : "",
      })
      setInfoData({
        project: caseData.project || "",
        priority: caseData.priority || "Média",
        dueDate: caseData.dueDateIso ? caseData.dueDateIso.slice(0, 10) : "",
        completed: caseData.completed || false,
      })
      setDescricaoDraft(caseData.descricao || "")
      setCnjDraft(caseData.numero || "")
      setTags(caseData.tags || [])
      setEditingHeader(false)
      setEditingInfo(false)
      setEditingDescricao(false)
      setEditingTags(false)
      setChatInput("")
      void loadDocs(caseData.id)
      void loadChat(caseData.id)
      void loadAndamentos(caseData.id)
    }
  }, [isOpen, caseData, loadDocs, loadChat, loadAndamentos])

  const persistCase = async (partial: {
    titulo?: string
    status?: string
    prioridade?: string
    prazo?: string | null
    tags?: string[]
    concluido?: boolean
    descricao?: string | null
    numero?: string
  }) => {
    if (!localCase) return
    try {
      const updated = await processosApi.atualizar(localCase.id, partial)
      const mapped = mapProcessoToCase(updated)
      setLocalCase(mapped)
      onUpdated?.(mapped)
      invalidateDashboardCache()
      toast({ title: "Salvo", description: "Caso atualizado com sucesso" })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    const text = chatInput.trim()
    if (!text || !conversacaoId) return
    setChatInput("")
    setIsTyping(true)
    try {
      const { mensagemUsuario, mensagemIa } = await chatApi.enviarMensagem(conversacaoId, text)
      setMessages((prev) => [...prev, mensagemUsuario, mensagemIa])
    } catch (error) {
      setChatInput(text)
      toast({
        title: "Erro no chat",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleChatFeedback = async (messageId: string, util: boolean) => {
    try {
      const updated = await chatApi.registrarFeedback(messageId, util)
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback: updated.feedback ?? null } : m)),
      )
    } catch (error) {
      toast({
        title: "Erro ao avaliar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !localCase) return
    await uploadFiles(Array.from(files))
    e.target.value = ""
  }

  const uploadFiles = async (files: File[]) => {
    if (!localCase || files.length === 0) return
    setIsUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map((file) => documentosApi.upload(localCase.id, file)),
      )
      setDocuments((prev) => [...uploaded, ...prev])
      toast({
        title: "Sucesso!",
        description: `${uploaded.length} arquivo(s) enviado(s)`,
      })
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha no upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files || [])
    await uploadFiles(files)
  }

  const handleDeleteDoc = async (docId: string) => {
    try {
      await documentosApi.remover(docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast({ title: "Documento removido" })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  if (!localCase) return null

  const client = localCase.cliente

  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 gap-0 flex flex-col h-full overflow-hidden">
        <SheetHeader className="p-4 pr-14 border-b bg-secondary/30 space-y-2 shrink-0">
          <SheetDescription className="sr-only">
            Detalhes, documentos, timeline, andamentos e chat do caso
          </SheetDescription>
          {editingHeader ? (
            <div className="space-y-2">
              <Input value={headerData.title} onChange={(e) => setHeaderData({ ...headerData, title: e.target.value })} />
              <div className="flex gap-2">
                <Select
                  value={headerData.project || undefined}
                  onValueChange={(value) => setHeaderData({ ...headerData, project: value })}
                >
                  <SelectTrigger className="flex-1" size="sm" aria-label="Status do caso">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {processoStatusOptionsFor(headerData.project).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={headerData.priority || undefined}
                  onValueChange={(value) => setHeaderData({ ...headerData, priority: value })}
                >
                  <SelectTrigger className="w-[110px]" size="sm" aria-label="Prioridade">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input type="date" value={headerData.dueDate} onChange={(e) => setHeaderData({ ...headerData, dueDate: e.target.value })} />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingHeader(false)}><X className="w-4 h-4" /></Button>
                <Button
                  size="sm"
                  onClick={() => {
                    void persistCase({
                      titulo: headerData.title,
                      status: headerData.project,
                      prioridade: headerData.priority,
                      prazo: headerData.dueDate ? new Date(`${headerData.dueDate}T12:00:00`).toISOString() : null,
                      concluido: isProcessoStatusConcluido(headerData.project) || localCase.completed,
                    }).then(() => setEditingHeader(false))
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <SheetTitle className="text-left text-base leading-snug">{localCase.title}</SheetTitle>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{localCase.numero}</p>
                <div className="flex gap-2 mt-2.5 flex-wrap">
                  <Badge variant={localCase.priority === "Alta" ? "destructive" : localCase.priority === "Baixa" ? "secondary" : "default"}>
                    {localCase.priority}
                  </Badge>
                  <Badge variant="outline">{localCase.project || "Sem status"}</Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {localCase.dueDate || "Sem prazo"}
                  </Badge>
                </div>
              </div>
              {canWrite && (
                <Button size="icon" variant="ghost" className="shrink-0 min-h-10 min-w-10" aria-label="Editar título e status" onClick={() => setEditingHeader(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 overflow-hidden gap-0"
        >
          <TabsList className="mx-4 mt-3 flex w-[calc(100%-2rem)] overflow-x-auto shrink-0 justify-start h-auto p-1 gap-1">
            <TabsTrigger value="info" className="shrink-0 px-2 sm:px-3 min-h-10" aria-label="Informações">
              <Briefcase className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Info</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="shrink-0 px-2 sm:px-3 min-h-10" aria-label="Documentos">
              <FolderOpen className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="shrink-0 px-2 sm:px-3 min-h-10" aria-label="Timeline">
              <Clock className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="andamentos" className="shrink-0 px-2 sm:px-3 min-h-10" aria-label="Andamentos">
              <History className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Andamentos</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="shrink-0 px-2 sm:px-3 min-h-10" aria-label="Chat IA">
              <MessageCircle className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-auto p-4 space-y-3 m-0 min-h-0 data-[state=inactive]:hidden">
            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Informações
                </h4>
                {!editingInfo ? (
                  canWrite ? (
                    <Button size="icon" variant="ghost" className="min-h-10 min-w-10 shrink-0" aria-label="Editar informações" onClick={() => setEditingInfo(true)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  ) : null
                ) : (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingInfo(false)}><X className="w-3.5 h-3.5" /></Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        void persistCase({
                          status: infoData.project,
                          prioridade: infoData.priority,
                          prazo: infoData.dueDate ? new Date(`${infoData.dueDate}T12:00:00`).toISOString() : null,
                          concluido: infoData.completed,
                        }).then(() => setEditingInfo(false))
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {editingInfo ? (
                <div className="space-y-2.5">
                  <Select
                    value={infoData.project || undefined}
                    onValueChange={(next) => {
                      setInfoData({
                        ...infoData,
                        project: next,
                        completed: isProcessoStatusConcluido(next) ? true : infoData.completed,
                      })
                    }}
                  >
                    <SelectTrigger className="w-full" aria-label="Status do caso">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {processoStatusOptionsFor(infoData.project).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={infoData.priority || undefined}
                    onValueChange={(value) => setInfoData({ ...infoData, priority: value })}
                  >
                    <SelectTrigger className="w-full" aria-label="Prioridade">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={infoData.dueDate} onChange={(e) => setInfoData({ ...infoData, dueDate: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={infoData.completed}
                      onChange={(e) => setInfoData({ ...infoData, completed: e.target.checked })}
                    />
                    Concluído
                  </label>
                </div>
              ) : (
                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-background/80 border border-border/60 px-3 py-2.5 space-y-1">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Status
                    </dt>
                    <dd className="text-sm font-medium">{localCase.project || "—"}</dd>
                  </div>
                  <div className="rounded-md bg-background/80 border border-border/60 px-3 py-2.5 space-y-1">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Prazo
                    </dt>
                    <dd className="text-sm font-medium">{localCase.dueDate || "—"}</dd>
                  </div>
                  <div className="rounded-md bg-background/80 border border-border/60 px-3 py-2.5 space-y-1">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Flag className="w-3 h-3" /> Prioridade
                    </dt>
                    <dd>
                      <Badge variant={localCase.priority === "Alta" ? "destructive" : localCase.priority === "Baixa" ? "secondary" : "default"}>
                        {localCase.priority}
                      </Badge>
                    </dd>
                  </div>
                  <div className="rounded-md bg-background/80 border border-border/60 px-3 py-2.5 space-y-1">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <CircleDot className="w-3 h-3" /> Situação
                    </dt>
                    <dd>
                      <Badge variant={localCase.completed ? "secondary" : "outline"}>
                        {localCase.completed ? "Concluído" : "Ativo"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="rounded-md bg-background/80 border border-border/60 px-3 py-2.5 space-y-1">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Responsável
                    </dt>
                    <dd className="text-sm font-medium">{localCase.responsavel?.nome || "—"}</dd>
                  </div>
                  <div className="rounded-md bg-background/80 border border-border/60 px-3 py-2.5 space-y-1">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Co-responsável
                    </dt>
                    <dd className="text-sm font-medium">{localCase.coResponsavel?.nome || "—"}</dd>
                  </div>
                </dl>
              )}
            </section>

            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Descrição
                </h4>
                {!editingDescricao ? (
                  canWrite ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => {
                      setDescricaoDraft(localCase.descricao || "")
                      setEditingDescricao(true)
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  ) : null
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setDescricaoDraft(localCase.descricao || "")
                        setEditingDescricao(false)
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        void persistCase({
                          descricao: descricaoDraft.trim() || null,
                        }).then(() => setEditingDescricao(false))
                      }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {editingDescricao ? (
                <Textarea
                  value={descricaoDraft}
                  onChange={(e) => setDescricaoDraft(e.target.value)}
                  placeholder="Sobre o que se trata este caso..."
                  className="min-h-[100px] resize-y bg-background"
                />
              ) : localCase.descricao ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {localCase.descricao}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma descrição</p>
              )}
            </section>

            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Tags
                </h4>
                {!editingTags ? (
                  canWrite ? (
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingTags(true)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  ) : null
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      void persistCase({ tags }).then(() => setEditingTags(false))
                    }}
                  >
                    Salvar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 min-h-[28px]">
                {tags.length === 0 && !editingTags ? (
                  <p className="text-sm text-muted-foreground">Nenhuma tag</p>
                ) : (
                  tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      {tag}
                      {editingTags && (
                        <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                )}
              </div>
              {editingTags && (
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nova tag" />
                  <Button
                    size="icon"
                    onClick={() => {
                      if (!newTag.trim()) return
                      setTags((prev) => [...prev, newTag.trim()])
                      setNewTag("")
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Cliente
              </h4>
              <div className="rounded-md bg-background/80 border border-border/60 p-3 space-y-3">
                <p className="text-sm font-semibold">{client?.nome ?? "Sem cliente vinculado"}</p>
                <dl className="grid gap-2.5 text-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="text-muted-foreground w-20 shrink-0 text-xs pt-0.5">CPF</span>
                    <dd className="font-medium">{client?.cpf ?? "—"}</dd>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-muted-foreground w-20 shrink-0 text-xs pt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                    <dd className="font-medium break-all">{client?.email ?? "—"}</dd>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-muted-foreground w-20 shrink-0 text-xs pt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Telefone
                    </span>
                    <dd className="font-medium">{client?.telefone ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="docs" className="flex-1 overflow-auto p-4 space-y-4 m-0 min-h-0 data-[state=inactive]:hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="font-medium">Documentos</h4>
              <div className="flex gap-2">
                {canWrite && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!localCase}
                    onClick={() => setGerarDocOpen(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Gerar documento com IA
                  </Button>
                )}
                <div>
                  <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => void handleFileUpload(e)} />
                  <Button size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                    Enviar
                  </Button>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`w-full rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
              }`}
              onDragEnter={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => void handleDrop(e)}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading
                ? "Enviando arquivos..."
                : "Arraste arquivos aqui ou clique para selecionar"}
            </button>
            {loadingDocs ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{doc.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.tamanho)} · {formatDatePt(doc.criadoEm)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => window.open(doc.urlArquivo, "_blank")}>
                        <Download className="w-4 h-4" />
                      </Button>
                      {canDeleteDocs && (
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => void handleDeleteDoc(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 overflow-auto p-4 space-y-4 m-0 min-h-0 data-[state=inactive]:hidden">
            <CaseTimelineTab
              processoId={localCase?.id ?? null}
              active={activeTab === "timeline"}
            />
          </TabsContent>

          <TabsContent value="andamentos" className="flex-1 overflow-auto p-4 space-y-4 m-0 min-h-0 data-[state=inactive]:hidden">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Andamentos
              </h4>
              <Button
                size="sm"
                variant="outline"
                disabled={syncingAndamentos || savingCnj || !localCase}
                onClick={() => void handleSyncAndamentos()}
              >
                {syncingAndamentos ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Sincronizar
              </Button>
            </div>

            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cnj-numero">Número CNJ</Label>
                <div className="flex gap-2">
                  <Input
                    id="cnj-numero"
                    value={cnjDraft}
                    onChange={(e) => setCnjDraft(e.target.value)}
                    placeholder="0001234-56.2024.8.26.0100"
                    className="font-mono text-sm"
                    disabled={!canWrite || savingCnj}
                  />
                  {canWrite && (
                    <Button
                      size="sm"
                      className="shrink-0"
                      disabled={savingCnj || cnjDraft.trim() === (localCase?.numero || "")}
                      onClick={() => void handleSaveCnj()}
                    >
                      {savingCnj ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formato: NNNNNNN-DD.AAAA.J.TR.OOOO — usado na consulta DataJud
                </p>
              </div>
            </section>

            {loadingAndamentos ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : andamentos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum andamento sincronizado ainda
              </p>
            ) : (
              <ol className="relative space-y-0 border-l border-border ml-2">
                {andamentos.map((item) => (
                  <li key={item.id} className="relative pl-6 pb-4 last:pb-0">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                    <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDatePt(item.data)}
                      </p>
                      <p className="text-sm">{item.descricao}</p>
                      {item.explicacao ? (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.explicacao}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col min-h-0 m-0 p-0 overflow-hidden data-[state=inactive]:hidden"
          >
            <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="flex gap-2">
                    <Bot className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm bg-secondary p-3 rounded-lg">
                      Olá! Sou o assistente exclusivo deste caso. Posso resumir o processo,
                      analisar arquivos anexados e tirar dúvidas gerais. As respostas não
                      substituem a análise de um advogado.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.isUser ? "justify-end" : ""}`}>
                    {!msg.isUser && <Bot className="w-5 h-5 text-primary shrink-0" />}
                    <div className={`max-w-[85%] ${msg.isUser ? "" : ""}`}>
                      <div className={`text-sm p-3 rounded-lg whitespace-pre-wrap ${msg.isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-secondary"}`}>
                        {msg.conteudo}
                      </div>
                      {!msg.isUser && msg.fontes && msg.fontes.length > 0 ? (
                        <ChatCitations fontes={msg.fontes} compact />
                      ) : null}
                      {!msg.isUser ? (
                        <ChatMessageFeedback
                          messageId={msg.id}
                          feedback={msg.feedback}
                          onFeedback={handleChatFeedback}
                        />
                      ) : null}
                    </div>
                    {msg.isUser && <User className="w-5 h-5 shrink-0" />}
                  </div>
                ))}
                {isTyping && <p className="text-xs text-muted-foreground">Assistente digitando...</p>}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="shrink-0 p-3 border-t bg-background space-y-2">
              <AiDisclaimer compact />
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pergunte sobre o caso ou os arquivos..."
                  className="min-h-[44px] max-h-28 resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void handleSendMessage()
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="shrink-0"
                  onClick={() => void handleSendMessage()}
                  disabled={isTyping || !chatInput.trim() || !conversacaoId}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>

    <GenerateDocumentModal
      isOpen={gerarDocOpen}
      onClose={() => setGerarDocOpen(false)}
      processoId={localCase.id}
      processoTitulo={localCase.title}
      onSaved={() => void loadDocs(localCase.id)}
    />
    </>
  )
}
