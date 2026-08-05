"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import type { CaseView } from "@/lib/processo-mapper"
import { mapProcessoToCase } from "@/lib/processo-mapper"
import { processosApi } from "@/lib/processos-api"
import { documentosApi, type DocumentoApi } from "@/lib/documentos-api"
import { chatApi, type MensagemApi } from "@/lib/chat-api"
import { formatBytes, formatDatePt } from "@/lib/format"

interface CasePanelProps {
  isOpen: boolean
  onClose: () => void
  caseData: CaseView | null
  onUpdated?: (caseData: CaseView) => void
}

export function CasePanel({ isOpen, onClose, caseData, onUpdated }: CasePanelProps) {
  const { toast } = useToast()
  const [localCase, setLocalCase] = useState<CaseView | null>(caseData)
  const [messages, setMessages] = useState<MensagemApi[]>([])
  const [conversacaoId, setConversacaoId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [documents, setDocuments] = useState<DocumentoApi[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [editingHeader, setEditingHeader] = useState(false)
  const [headerData, setHeaderData] = useState({ title: "", priority: "", project: "", dueDate: "" })
  const [editingInfo, setEditingInfo] = useState(false)
  const [infoData, setInfoData] = useState({ project: "", priority: "", dueDate: "", completed: false })
  const [editingTags, setEditingTags] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && caseData) {
      setLocalCase(caseData)
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
      setTags(caseData.tags || [])
      setEditingHeader(false)
      setEditingInfo(false)
      setEditingTags(false)
      setChatInput("")
      void loadDocs(caseData.id)
      void loadChat(caseData.id)
    }
  }, [isOpen, caseData, loadDocs, loadChat])

  const persistCase = async (partial: {
    titulo?: string
    status?: string
    prioridade?: string
    prazo?: string | null
    tags?: string[]
    concluido?: boolean
  }) => {
    if (!localCase) return
    try {
      const updated = await processosApi.atualizar(localCase.id, partial)
      const mapped = mapProcessoToCase(updated)
      setLocalCase(mapped)
      onUpdated?.(mapped)
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
      toast({
        title: "Erro no chat",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 gap-0 flex flex-col h-full overflow-hidden">
        <SheetHeader className="p-4 border-b bg-secondary/30 space-y-2 shrink-0">
          {editingHeader ? (
            <div className="space-y-2">
              <Input value={headerData.title} onChange={(e) => setHeaderData({ ...headerData, title: e.target.value })} />
              <div className="flex gap-2">
                <Input value={headerData.project} onChange={(e) => setHeaderData({ ...headerData, project: e.target.value })} placeholder="Status" />
                <select
                  value={headerData.priority}
                  onChange={(e) => setHeaderData({ ...headerData, priority: e.target.value })}
                  className="px-2 rounded-md border border-input bg-transparent"
                >
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                </select>
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
              <Button size="icon" variant="ghost" className="shrink-0" onClick={() => setEditingHeader(true)}>
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </SheetHeader>

        <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0 overflow-hidden gap-0">
          <TabsList className="mx-4 mt-3 grid grid-cols-3 shrink-0">
            <TabsTrigger value="info"><Briefcase className="w-4 h-4 mr-1" />Info</TabsTrigger>
            <TabsTrigger value="docs"><FolderOpen className="w-4 h-4 mr-1" />Docs</TabsTrigger>
            <TabsTrigger value="chat"><MessageCircle className="w-4 h-4 mr-1" />Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-auto p-4 space-y-3 m-0 min-h-0 data-[state=inactive]:hidden">
            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Informações
                </h4>
                {!editingInfo ? (
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingInfo(true)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
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
                  <Input value={infoData.project} onChange={(e) => setInfoData({ ...infoData, project: e.target.value })} placeholder="Status" />
                  <select
                    value={infoData.priority}
                    onChange={(e) => setInfoData({ ...infoData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm"
                  >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
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
                </dl>
              )}
            </section>

            <section className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  Tags
                </h4>
                {!editingTags ? (
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingTags(true)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
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
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Documentos</h4>
              <div>
                <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => void handleFileUpload(e)} />
                <Button size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                  Enviar
                </Button>
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
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => void handleDeleteDoc(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col min-h-0 m-0 p-0 overflow-hidden data-[state=inactive]:hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="flex gap-2">
                    <Bot className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm bg-secondary p-3 rounded-lg">
                      Olá! Sou o assistente exclusivo deste caso. Posso resumir o processo,
                      analisar arquivos anexados e tirar dúvidas gerais. Como posso ajudar?
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.isUser ? "justify-end" : ""}`}>
                    {!msg.isUser && <Bot className="w-5 h-5 text-primary shrink-0" />}
                    <div className={`text-sm p-3 rounded-lg max-w-[85%] whitespace-pre-wrap ${msg.isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                      {msg.conteudo}
                    </div>
                    {msg.isUser && <User className="w-5 h-5 shrink-0" />}
                  </div>
                ))}
                {isTyping && <p className="text-xs text-muted-foreground">Assistente digitando...</p>}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="shrink-0 p-3 border-t bg-background flex gap-2">
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
