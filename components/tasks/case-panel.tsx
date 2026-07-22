"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import {
  FileText,
  MessageCircle,
  FolderOpen,
  Send,
  Upload,
  User,
  Bot,
  Calendar,
  Tag,
  Clock,
  Briefcase,
  Download,
  Trash2,
  Pencil,
  Check,
  X,
  Plus,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface CasePanelProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
}

const MOCK_DOCS = [
  { id: 1, name: "Contrato_XYZ_v1.pdf", size: "245 KB", date: "10 Nov, 2025", type: "pdf" },
  { id: 2, name: "Procuração_Empresa.pdf", size: "118 KB", date: "12 Nov, 2025", type: "pdf" },
  { id: 3, name: "Notas_Reunião.docx", size: "32 KB", date: "15 Nov, 2025", type: "doc" },
]

const INITIAL_AI_MESSAGE = {
  id: 1,
  role: "ai",
  content:
    "Olá! Sou a IA jurídica da Alar. Posso ajudar com análise de documentos, pesquisa de jurisprudência e dúvidas sobre este caso. Como posso ajudar?",
  time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
}

const AI_RESPONSES = [
  "Com base nas informações do caso, recomendo verificar a jurisprudência recente do STJ sobre o tema.",
  "Este tipo de contrato geralmente exige cláusulas específicas de rescisão. Deseja que eu prepare um modelo?",
  "Encontrei 3 precedentes relevantes para este caso. Posso detalhar cada um deles se necessário.",
  "A documentação está incompleta. Faltam o instrumento procuratório e as certidões negativas do cliente.",
  "Para esta ação trabalhista, o prazo prescricional é de 2 anos após a extinção do vínculo empregatício.",
]

export function CasePanel({ isOpen, onClose, caseData }: CasePanelProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState([INITIAL_AI_MESSAGE])
  const [chatInput, setChatInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [documents, setDocuments] = useState(MOCK_DOCS)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- Edição do Header ---
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerData, setHeaderData] = useState({ title: "", priority: "", project: "", dueDate: "" })

  // --- Edição das Informações do Caso ---
  const [editingInfo, setEditingInfo] = useState(false)
  const [infoData, setInfoData] = useState({ project: "", priority: "", dueDate: "", completed: false })

  // --- Edição das Tags ---
  const [editingTags, setEditingTags] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // --- Edição dos Dados do Cliente ---
  const [editingClient, setEditingClient] = useState(false)
  const [clientData, setClientData] = useState({
    name: "Empresa XYZ Ltda.",
    cnpj: "12.345.678/0001-90",
    responsible: "João Silva",
    email: "joao@xyz.com.br",
    phone: "(11) 99999-0000",
  })
  const [clientDraft, setClientDraft] = useState({ ...clientData })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Resetar mensagens ao abrir um novo caso
  useEffect(() => {
    if (isOpen && caseData) {
      setMessages([INITIAL_AI_MESSAGE])
      setChatInput("")
      setHeaderData({
        title: caseData.title || "",
        priority: caseData.priority || "Média",
        project: caseData.project || "",
        dueDate: caseData.dueDate || "",
      })
      setInfoData({
        project: caseData.project || "",
        priority: caseData.priority || "Média",
        dueDate: caseData.dueDate || "",
        completed: caseData.completed || false,
      })
      setTags(caseData.tags || [])
      setEditingHeader(false)
      setEditingInfo(false)
      setEditingTags(false)
      setEditingClient(false)
    }
  }, [isOpen, caseData?.id])

  const handleSendMessage = () => {
    const text = chatInput.trim()
    if (!text) return

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, aiMsg])
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    setTimeout(() => {
      const newDocs = Array.from(files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
        type: file.name.endsWith(".pdf") ? "pdf" : "doc",
      }))
      setDocuments((prev) => [...prev, ...newDocs])
      setIsUploading(false)
      toast({
        title: "Sucesso!",
        description: `${files.length} arquivo${files.length !== 1 ? "s" : ""} enviado${files.length !== 1 ? "s" : ""} com sucesso`,
      })
      e.target.value = ""
    }, 1500)
  }

  const handleDownloadDoc = (doc: any) => {
    toast({
      title: "Download",
      description: `Iniciando download de ${doc.name}...`,
    })
    setTimeout(() => {
      toast({
        title: "Concluído!",
        description: `${doc.name} foi baixado`,
      })
    }, 2000)
  }

  const handleDeleteDoc = (docId: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  if (!caseData) return null

  const priorityColors: Record<string, string> = {
    Alta: "destructive",
    Média: "default",
    Baixa: "secondary",
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="flex flex-col gap-1.5 p-4 px-6 pt-6 pb-4 border-b border-border">
          {editingHeader ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Título</Label>
                <Input
                  value={headerData.title}
                  onChange={(e) => setHeaderData((d) => ({ ...d, title: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Prioridade</Label>
                  <select
                    value={headerData.priority}
                    onChange={(e) => setHeaderData((d) => ({ ...d, priority: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-md border border-input bg-transparent text-sm text-foreground"
                  >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Área</Label>
                  <Input
                    value={headerData.project}
                    onChange={(e) => setHeaderData((d) => ({ ...d, project: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Prazo</Label>
                  <Input
                    value={headerData.dueDate}
                    onChange={(e) => setHeaderData((d) => ({ ...d, dueDate: e.target.value }))}
                    className="text-sm"
                    placeholder="DD/MM/AAAA"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setEditingHeader(false)} className="h-8 gap-1.5">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    Object.assign(caseData, {
                      title: headerData.title,
                      priority: headerData.priority,
                      project: headerData.project,
                      dueDate: headerData.dueDate,
                    })
                    setInfoData((d) => ({
                      ...d,
                      priority: headerData.priority,
                      project: headerData.project,
                      dueDate: headerData.dueDate,
                    }))
                    setEditingHeader(false)
                  }}
                >
                  <Check className="w-3.5 h-3.5" /> Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base font-semibold text-foreground leading-tight line-clamp-2">
                  {headerData.title || caseData.title}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant={priorityColors[(headerData.priority || caseData.priority)] as any} className="text-xs">
                    {headerData.priority || caseData.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {headerData.project || caseData.project}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {headerData.dueDate || caseData.dueDate}
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setEditingHeader(true)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="dados" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-6 mt-4 mb-0 w-auto justify-start bg-muted/50">
            <TabsTrigger value="dados" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Dados do Caso
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              Chat IA
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-1.5 text-xs">
              <FolderOpen className="w-3.5 h-3.5" />
              Documentos
            </TabsTrigger>
          </TabsList>

          {/* ABA: Dados do Caso */}
          <TabsContent value="dados" className="flex-1 overflow-auto m-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-6">
                {/* Informações do caso */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Informações do Caso</h3>
                    {!editingInfo ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingInfo(true)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => setEditingInfo(false)}>
                          <X className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-primary"
                          onClick={() => {
                            Object.assign(caseData, {
                              project: infoData.project,
                              priority: infoData.priority,
                              dueDate: infoData.dueDate,
                              completed: infoData.completed,
                            })
                            setHeaderData((d) => ({
                              ...d,
                              priority: infoData.priority,
                              project: infoData.project,
                              dueDate: infoData.dueDate,
                            }))
                            setEditingInfo(false)
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingInfo ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Área Jurídica</Label>
                        <Input
                          value={infoData.project}
                          onChange={(e) => setInfoData((d) => ({ ...d, project: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Prioridade</Label>
                        <select
                          value={infoData.priority}
                          onChange={(e) => setInfoData((d) => ({ ...d, priority: e.target.value }))}
                          className="w-full h-8 px-2 rounded-md border border-input bg-transparent text-sm text-foreground"
                        >
                          <option>Baixa</option>
                          <option>Média</option>
                          <option>Alta</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Prazo</Label>
                        <Input
                          value={infoData.dueDate}
                          onChange={(e) => setInfoData((d) => ({ ...d, dueDate: e.target.value }))}
                          className="h-8 text-sm"
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <select
                          value={infoData.completed ? "Concluído" : "Em Andamento"}
                          onChange={(e) => setInfoData((d) => ({ ...d, completed: e.target.value === "Concluído" }))}
                          className="w-full h-8 px-2 rounded-md border border-input bg-transparent text-sm text-foreground"
                        >
                          <option>Em Andamento</option>
                          <option>Concluído</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Área Jurídica</p>
                        <p className="text-sm font-medium">{infoData.project || caseData.project}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Prioridade</p>
                        <p className="text-sm font-medium">{infoData.priority || caseData.priority}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Prazo</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {infoData.dueDate || caseData.dueDate}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-medium">{infoData.completed ? "Concluído" : "Em Andamento"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Classificações</h3>
                    {!editingTags ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingTags(true)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-primary"
                        onClick={() => {
                          caseData.tags = tags
                          setEditingTags(false)
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs gap-1 pr-1">
                        {tag}
                        {editingTags && (
                          <button
                            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                            className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
                          >
                            <X className="w-2.5 h-2.5 text-destructive" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {editingTags && (
                      <div className="flex items-center gap-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.nativeEvent.isComposing && newTag.trim()) {
                              setTags((prev) => [...prev, newTag.trim()])
                              setNewTag("")
                            }
                          }}
                          placeholder="Nova tag..."
                          className="h-6 text-xs w-28 px-2"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-primary"
                          onClick={() => {
                            if (newTag.trim()) {
                              setTags((prev) => [...prev, newTag.trim()])
                              setNewTag("")
                            }
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {!editingTags && tags.length === 0 && (
                      <p className="text-xs text-muted-foreground">Nenhuma classificação adicionada.</p>
                    )}
                  </div>
                </div>

                {/* Dados do cliente */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Dados do Cliente</h3>
                    {!editingClient ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setClientDraft({ ...clientData })
                          setEditingClient(true)
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => setEditingClient(false)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-primary"
                          onClick={() => {
                            setClientData({ ...clientDraft })
                            setEditingClient(false)
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                    {editingClient ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome</Label>
                            <Input
                              value={clientDraft.name}
                              onChange={(e) => setClientDraft((d) => ({ ...d, name: e.target.value }))}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">CNPJ</Label>
                            <Input
                              value={clientDraft.cnpj}
                              onChange={(e) => setClientDraft((d) => ({ ...d, cnpj: e.target.value }))}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Responsável</Label>
                          <Input
                            value={clientDraft.responsible}
                            onChange={(e) => setClientDraft((d) => ({ ...d, responsible: e.target.value }))}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">E-mail</Label>
                          <Input
                            value={clientDraft.email}
                            onChange={(e) => setClientDraft((d) => ({ ...d, email: e.target.value }))}
                            className="h-8 text-sm"
                            type="email"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Telefone</Label>
                          <Input
                            value={clientDraft.phone}
                            onChange={(e) => setClientDraft((d) => ({ ...d, phone: e.target.value }))}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{clientData.name}</p>
                            <p className="text-xs text-muted-foreground">CNPJ: {clientData.cnpj}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-xs">Responsável</span>
                            <span className="text-xs font-medium">{clientData.responsible}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-xs">E-mail</span>
                            <span className="text-xs font-medium">{clientData.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-xs">Telefone</span>
                            <span className="text-xs font-medium">{clientData.phone}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Anotações */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Anotações</h3>
                  <Textarea
                    placeholder="Adicione anotações sobre o caso..."
                    className="min-h-[100px] text-sm resize-none"
                  />
                  <Button size="sm" className="mt-2 bg-primary hover:bg-primary/90">
                    Salvar Anotações
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ABA: Chat IA */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "ai" ? "bg-primary/10" : "bg-secondary"
                      }`}
                    >
                      {msg.role === "ai" ? (
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-foreground" />
                      )}
                    </div>
                    <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                          msg.role === "ai"
                            ? "bg-muted text-foreground rounded-tl-none"
                            : "bg-primary text-primary-foreground rounded-tr-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="px-6 py-4 border-t border-border">
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder="Pergunte algo sobre o caso..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  className="resize-none text-sm"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Enter para enviar, Shift+Enter para nova linha</p>
            </div>
          </TabsContent>

          {/* ABA: Documentos */}
          <TabsContent value="documentos" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="px-6 pt-4 pb-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                disabled={isUploading}
                className="w-full gap-2 border-dashed border-2 h-16 bg-transparent hover:bg-muted/50 disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`w-4 h-4 text-muted-foreground ${isUploading ? "animate-pulse" : ""}`} />
                <span className="text-sm text-muted-foreground">
                  {isUploading ? "Enviando..." : "Clique para enviar documentos"}
                </span>
              </Button>
            </div>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-2 pb-4">
                <p className="text-xs text-muted-foreground mb-3">
                  {documents.length} documento{documents.length !== 1 ? "s" : ""} salvos
                </p>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} · {doc.date}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleDownloadDoc(doc)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDoc(doc.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
