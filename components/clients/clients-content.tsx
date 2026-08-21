"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Trash2, Pencil, Search, Loader2, Download, UserX, Users, FileSpreadsheet } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ClientModal } from "./client-modal"
import { ClientsImportDialog } from "./clients-import-dialog"
import { ContactDialog } from "@/components/shared/contact-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  clientesApi,
  isClienteAnonimizado,
  mapClienteToCard,
  type ClienteCard,
  type ClienteFormData,
} from "@/lib/clientes-api"
import { formatDocumentoCliente, formatPhone } from "@/lib/masks"
import { useAuth } from "@/components/auth/auth-provider"
import { canAnonimizarCliente, canExportarCliente, canWriteClientesProcessos } from "@/lib/roles"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import { clienteHref, rotas } from "@/lib/app-routes"
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
import { ListSkeleton } from "@/components/shared/list-skeleton"

export function ClientsContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const canWrite = canWriteClientesProcessos(user?.role)
  const canExport = canExportarCliente(user?.role)
  const canAnonimizar = canAnonimizarCliente(user?.role)
  const [clients, setClients] = useState<ClienteCard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [debouncedQ, setDebouncedQ] = useState("")
  const PAGE_SIZE = 12

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchTerm.trim()), 300)
    return () => window.clearTimeout(t)
  }, [searchTerm])

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await clientesApi.listarPagina({
        page,
        limit: PAGE_SIZE,
        q: debouncedQ || undefined,
      })
      setClients(data.items.map(mapClienteToCard))
      setTotal(data.total)
    } catch (error) {
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Não foi possível buscar os clientes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, page, debouncedQ])

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

  useEffect(() => {
    if (searchParams.get("novo") !== "1" || !canWrite) return
    window.dispatchEvent(new CustomEvent("openNewClientModal"))
    const params = new URLSearchParams(searchParams.toString())
    params.delete("novo")
    const qs = params.toString()
    router.replace(qs ? `${rotas.clientes}?${qs}` : rotas.clientes, { scroll: false })
  }, [searchParams, canWrite, router])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [debouncedQ])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleSaveClient = async (clientData: ClienteFormData) => {
    if (selectedClient) {
      await clientesApi.atualizar(selectedClient.id, clientData)
    } else {
      await clientesApi.criar(clientData)
    }
    invalidateDashboardCache()
    setSelectedClient(null)
    await loadClients()
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
        invalidateDashboardCache()
        toast({
          title: "Cliente removido",
          description: "O cliente e os casos vinculados foram excluídos.",
        })
        await loadClients()
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
      await clientesApi.anonimizar(client.id)
      toast({
        title: "Cliente anonimizado",
        description: "Dados pessoais removidos. Casos foram mantidos sem identificação.",
      })
      await loadClients()
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
            placeholder="Buscar por nome, CPF, CNPJ ou cidade..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {canWrite && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="w-full sm:w-auto h-9 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Importar
            </Button>
            <Button
              onClick={handleNewClient}
              className="w-full sm:w-auto h-9 text-sm"
            >
              + Novo Cliente
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton variant="cards" count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="border-border/80 p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <Avatar className="w-11 h-11 ring-1 ring-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
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
                        aria-label="Exportar dados do cliente"
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
                      aria-label="Editar cliente"
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
                        aria-label="Anonimizar cliente"
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
                      aria-label="Excluir cliente"
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
                  <h3 className="font-semibold text-lg line-clamp-1">
                    <Link href={clienteHref(client.id)} className="hover:underline">
                      {client.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatDocumentoCliente(client)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline">{client.tipo === "PJ" ? "PJ" : "PF"}</Badge>
                    {isClienteAnonimizado(client) && (
                      <Badge variant="outline">Anonimizado</Badge>
                    )}
                  </div>
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

      {!isLoading && total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-sm text-muted-foreground">
            {total} cliente(s) · página {pageSafe} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageSafe <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageSafe >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Próxima página"
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && clients.length === 0 && (
        total === 0 && !searchTerm ? (
          <ListEmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Adicione clientes um a um, por documento (IA) ou importe um CSV na migração do escritório."
          >
            {canWrite && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Importar
                </Button>
                <Button
                  onClick={() => {
                    setSelectedClient(null)
                    setIsModalOpen(true)
                  }}
                >
                  + Novo cliente
                </Button>
              </div>
            )}
          </ListEmptyState>
        ) : (
          <ListEmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description="Tente outro nome, CPF/CNPJ ou limpe a busca."
          >
            {searchTerm ? (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                Limpar busca
              </Button>
            ) : null}
          </ListEmptyState>
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

      <ClientsImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          invalidateDashboardCache()
          void loadClients()
        }}
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
