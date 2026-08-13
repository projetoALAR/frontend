"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Trash2, Pencil, Search, Loader2, Download, UserX, Users } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ClientModal } from "./client-modal"
import { ContactDialog } from "@/components/shared/contact-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  clientesApi,
  isClienteAnonimizado,
  mapClienteToCard,
  type ClienteCard,
  type ClienteFormData,
} from "@/lib/clientes-api"
import { formatCpf, formatPhone, onlyDigits } from "@/lib/masks"
import { useAuth } from "@/components/auth/auth-provider"
import { canAnonimizarCliente, canExportarCliente, canWriteClientesProcessos } from "@/lib/roles"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ListEmptyState } from "@/components/shared/list-empty-state"

export function ClientsContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const canWrite = canWriteClientesProcessos(user?.role)
  const canExport = canExportarCliente(user?.role)
  const canAnonimizar = canAnonimizarCliente(user?.role)
  const [clients, setClients] = useState<ClienteCard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClienteCard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [lgpdTarget, setLgpdTarget] = useState<{
    client: ClienteCard
    modo: "excluir" | "anonimizar"
  } | null>(null)
  const [contact, setContact] = useState<{
    canal: "email" | "telefone"
    client: ClienteCard
  } | null>(null)

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await clientesApi.listar()
      setClients(data.map(mapClienteToCard))
    } catch (error) {
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Não foi possível buscar os clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearchTerm(q)
  }, [searchParams])

  useEffect(() => {
    if (!canWrite) return
    const handleOpenNewClient = () => {
      setSelectedClient(null)
      setIsModalOpen(true)
    }
    window.addEventListener("openNewClientModal", handleOpenNewClient)
    return () => window.removeEventListener("openNewClientModal", handleOpenNewClient)
  }, [canWrite])

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase()
    const termDigits = onlyDigits(searchTerm)
    return (
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.cpf.toLowerCase().includes(term) ||
      (termDigits.length >= 3 && onlyDigits(client.cpf).includes(termDigits))
    )
  })

  const handleSaveClient = async (clientData: ClienteFormData) => {
    if (selectedClient) {
      const updated = await clientesApi.atualizar(selectedClient.id, clientData)
      const card = mapClienteToCard({
        ...updated,
        _count: { processos: selectedClient.casesCount },
      })
      setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? card : c)))
    } else {
      const created = await clientesApi.criar(clientData)
      setClients((prev) => [mapClienteToCard(created), ...prev])
    }
    invalidateDashboardCache()
    setSelectedClient(null)
  }

  const handleExportClient = async (client: ClienteCard) => {
    setExportingId(client.id)
    try {
      const payload = await clientesApi.exportar(client.id)
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const stamp = new Date().toISOString().slice(0, 10)
      link.href = url
      link.download = `alar-cliente-${client.id.slice(0, 8)}-${stamp}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast({
        title: "Dados exportados",
        description: "Arquivo JSON baixado (pedido LGPD).",
      })
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setExportingId(null)
    }
  }

  const handleConfirmLgpd = async () => {
    if (!lgpdTarget) return
    const { client, modo } = lgpdTarget
    if (modo === "excluir") {
      setDeletingId(client.id)
      try {
        await clientesApi.remover(client.id)
        setClients((prev) => prev.filter((c) => c.id !== client.id))
        invalidateDashboardCache()
        toast({
          title: "Cliente removido",
          description: "O cliente e os casos vinculados foram excluídos.",
        })
      } catch (error) {
        toast({
          title: "Erro ao remover",
          description: error instanceof Error ? error.message : "Não foi possível deletar o cliente",
          variant: "destructive",
        })
      } finally {
        setDeletingId(null)
        setLgpdTarget(null)
      }
      return
    }

    setDeletingId(client.id)
    try {
      const updated = await clientesApi.anonimizar(client.id)
      const card = mapClienteToCard(updated)
      setClients((prev) => prev.map((c) => (c.id === client.id ? card : c)))
      toast({
        title: "Cliente anonimizado",
        description: "Dados pessoais removidos. Casos foram mantidos sem identificação.",
      })
    } catch (error) {
      toast({
        title: "Erro ao anonimizar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setLgpdTarget(null)
    }
  }

  const handleEditClient = (client: ClienteCard) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleNewClient = () => {
    setSelectedClient(null)
    setIsModalOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente por nome, email ou CPF..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canWrite && (
          <Button
            onClick={handleNewClient}
            className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
          >
            + Novo Cliente
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando clientes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <Card
              key={client.id}
              className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(client.name)}
                  </AvatarFallback>
                </Avatar>
                {canWrite && (
                  <div className="flex gap-1">
                    {canExport && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleExportClient(client)}
                        disabled={exportingId === client.id}
                        className="h-8 w-8 p-0"
                        title="Exportar dados (LGPD)"
                      >
                        {exportingId === client.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      className="h-8 w-8 p-0"
                      disabled={isClienteAnonimizado(client)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {canAnonimizar && !isClienteAnonimizado(client) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLgpdTarget({ client, modo: "anonimizar" })}
                        disabled={deletingId === client.id}
                        className="h-8 w-8 p-0"
                        title="Anonimizar (LGPD)"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLgpdTarget({ client, modo: "excluir" })}
                      disabled={deletingId === client.id}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Excluir cliente"
                    >
                      {deletingId === client.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{client.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{formatCpf(client.cpf)}</p>
                  {isClienteAnonimizado(client) && (
                    <Badge variant="outline" className="mt-1">
                      Anonimizado
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground line-clamp-1">
                    <span className="text-foreground">Email:</span> {client.email || "—"}
                  </p>
                  <p className="text-muted-foreground line-clamp-1">
                    <span className="text-foreground">Telefone:</span> {formatPhone(client.phone)}
                  </p>
                </div>

                <Badge variant="secondary">
                  {client.casesCount} {client.casesCount === 1 ? "processo" : "processos"}
                </Badge>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    disabled={!client.email}
                    onClick={() => setContact({ canal: "email", client })}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    disabled={!client.phone}
                    onClick={() => setContact({ canal: "telefone", client })}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Ligar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredClients.length === 0 && (
        clients.length === 0 && !searchTerm ? (
          <ListEmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Adicione clientes para vincular casos, documentos e prazos. Você pode importar dados depois via exportação LGPD."
          >
            {canWrite && (
              <Button
                onClick={() => {
                  setSelectedClient(null)
                  setIsModalOpen(true)
                }}
              >
                + Novo cliente
              </Button>
            )}
          </ListEmptyState>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="text-primary mt-2"
              >
                Limpar busca
              </Button>
            )}
          </div>
        )
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(null)
        }}
        onSave={handleSaveClient}
        clientData={selectedClient}
        isEditing={!!selectedClient}
      />

      {contact && (
        <ContactDialog
          open={!!contact}
          onOpenChange={(open) => !open && setContact(null)}
          alvoTipo="cliente"
          alvoId={contact.client.id}
          alvoNome={contact.client.name}
          canal={contact.canal}
          destino={contact.canal === "email" ? contact.client.email : contact.client.phone}
        />
      )}

      <AlertDialog open={!!lgpdTarget} onOpenChange={(open) => !open && setLgpdTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lgpdTarget?.modo === "anonimizar" ? "Anonimizar cliente?" : "Excluir cliente?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lgpdTarget?.modo === "anonimizar"
                ? `Os dados pessoais de ${lgpdTarget.client.name} serão apagados (nome, CPF, e-mail, telefone). Documentos e chats do caso também saem. Os processos permanecem sem identificação.`
                : `Isso apaga ${lgpdTarget?.client.name} e todos os casos, documentos e prazos vinculados. Não dá para desfazer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={lgpdTarget?.modo === "excluir" ? "bg-destructive text-white hover:bg-destructive/90" : ""}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmLgpd()
              }}
            >
              {lgpdTarget?.modo === "anonimizar" ? "Anonimizar" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
