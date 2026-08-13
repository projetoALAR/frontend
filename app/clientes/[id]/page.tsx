"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Loader2, Mail, Pencil, Phone, UserX, Trash2 } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { GlobalSearch } from "@/components/search/global-search"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { ClientModal } from "@/components/clients/client-modal"
import { ContactDialog } from "@/components/shared/contact-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import {
  canAnonimizarCliente,
  canExportarCliente,
  canWriteClientesProcessos,
} from "@/lib/roles"
import {
  clientesApi,
  isClienteAnonimizado,
  mapClienteToCard,
  type ClienteCard,
  type ClienteFormData,
} from "@/lib/clientes-api"
import { processosApi } from "@/lib/processos-api"
import { mapProcessoToCase } from "@/lib/processo-mapper"
import { casoHref, rotas } from "@/lib/app-routes"
import { formatDocumentoCliente, formatPhone } from "@/lib/masks"
import { formatDatePt } from "@/lib/format"
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

type LgpdModo = "anonimizar" | "excluir"

export default function ClientePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id
  const canWrite = canWriteClientesProcessos(user?.role)
  const canExport = canExportarCliente(user?.role)
  const canAnonimizar = canAnonimizarCliente(user?.role)

  const [client, setClient] = useState<ClienteCard | null>(null)
  const [casos, setCasos] = useState<ReturnType<typeof mapProcessoToCase>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [lgpdModo, setLgpdModo] = useState<LgpdModo | null>(null)
  const [lgpdBusy, setLgpdBusy] = useState(false)
  const [contact, setContact] = useState<{ canal: "email" | "telefone" } | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cliente, processos] = await Promise.all([
        clientesApi.obter(id),
        processosApi.listarPorCliente(id),
      ])
      setClient(mapClienteToCard(cliente))
      setCasos(processos.map(mapProcessoToCase))
    } catch (err) {
      setClient(null)
      setCasos([])
      setError(err instanceof Error ? err.message : "Cliente não encontrado")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const handleSave = async (dados: ClienteFormData) => {
    if (!client) return
    const updated = await clientesApi.atualizar(client.id, dados)
    setClient(mapClienteToCard({ ...updated, _count: { processos: client.casesCount } }))
    invalidateDashboardCache()
  }

  const handleExport = async () => {
    if (!client) return
    setExporting(true)
    try {
      const payload = await clientesApi.exportar(client.id)
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `cliente-${client.id}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast({ title: "Exportação pronta", description: "Arquivo JSON baixado." })
    } catch (err) {
      toast({
        title: "Erro ao exportar",
        description: err instanceof Error ? err.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleConfirmLgpd = async () => {
    if (!client || !lgpdModo) return
    setLgpdBusy(true)
    try {
      if (lgpdModo === "anonimizar") {
        const updated = await clientesApi.anonimizar(client.id)
        setClient(mapClienteToCard(updated))
        toast({ title: "Cliente anonimizado" })
      } else {
        await clientesApi.remover(client.id)
        invalidateDashboardCache()
        toast({ title: "Cliente excluído" })
        router.push(rotas.clientes)
      }
    } catch (err) {
      toast({
        title: "Não foi possível concluir",
        description: err instanceof Error ? err.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setLgpdBusy(false)
      setLgpdModo(null)
    }
  }

  const anonimizado = client ? isClienteAnonimizado(client) : false

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <header className="flex items-center gap-2 mb-4">
          <MobileNav />
          <GlobalSearch />
        </header>

        {loading ? (
          <ListSkeleton variant="detail" />
        ) : error || !client ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center py-16">
            <p className="text-sm text-muted-foreground">{error || "Cliente não encontrado"}</p>
            <Button variant="outline" onClick={() => router.push(rotas.clientes)}>
              Voltar aos clientes
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
                  <Link href={rotas.clientes}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Clientes
                  </Link>
                </Button>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{client.name}</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {formatDocumentoCliente(client)}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline">{client.tipo === "PJ" ? "Pessoa jurídica" : "Pessoa física"}</Badge>
                  {anonimizado && <Badge variant="outline">Anonimizado</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={anonimizado}
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
                {canExport && (
                  <Button variant="outline" size="sm" disabled={exporting} onClick={() => void handleExport()}>
                    {exporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                    Exportar
                  </Button>
                )}
                {canAnonimizar && !anonimizado && (
                  <Button variant="outline" size="sm" onClick={() => setLgpdModo("anonimizar")}>
                    <UserX className="w-4 h-4 mr-1" />
                    Anonimizar
                  </Button>
                )}
                {canWrite && (
                  <Button variant="destructive" size="sm" onClick={() => setLgpdModo("excluir")}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>

            <Card className="p-4 md:p-5 space-y-3">
              <h2 className="font-semibold">Ficha</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {client.tipo === "PJ" && (
                  <div>
                    <dt className="text-muted-foreground">Nome fantasia</dt>
                    <dd>{client.nomeFantasia || "—"}</dd>
                  </div>
                )}
                {client.tipo === "PF" && (
                  <div>
                    <dt className="text-muted-foreground">RG</dt>
                    <dd>{client.rg || "—"}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">E-mail</dt>
                  <dd>{client.email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Telefone</dt>
                  <dd>{formatPhone(client.phone)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Endereço</dt>
                  <dd>
                    {[client.endereco, client.cidade, client.uf, client.cep].filter(Boolean).join(" · ") || "—"}
                  </dd>
                </div>
                {client.observacoes && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Observações</dt>
                    <dd className="whitespace-pre-wrap">{client.observacoes}</dd>
                  </div>
                )}
              </dl>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!client.email}
                  onClick={() => setContact({ canal: "email" })}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!client.phone}
                  onClick={() => setContact({ canal: "telefone" })}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Ligar
                </Button>
              </div>
            </Card>

            <section className="space-y-3">
              <h2 className="font-semibold">
                Casos ({casos.length})
              </h2>
              {casos.length === 0 ? (
                <Card className="p-6 text-sm text-muted-foreground">
                  Nenhum caso vinculado a este cliente.
                </Card>
              ) : (
                <div className="space-y-2">
                  {casos.map((caso) => (
                    <Link key={caso.id} href={casoHref(caso.id)} className="block">
                      <Card className="p-4 hover:bg-secondary/40 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{caso.title}</p>
                            <p className="text-xs text-muted-foreground font-mono">{caso.numero}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="secondary">{caso.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">Prazo: {formatDatePt(caso.dueDateIso)}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {client && (
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          clientData={client}
          isEditing
        />
      )}

      {client && contact && (
        <ContactDialog
          open={!!contact}
          onOpenChange={(open) => !open && setContact(null)}
          alvoTipo="cliente"
          alvoId={client.id}
          alvoNome={client.name}
          canal={contact.canal}
          destino={contact.canal === "email" ? client.email : client.phone}
        />
      )}

      <AlertDialog open={!!lgpdModo} onOpenChange={(open) => !open && setLgpdModo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lgpdModo === "anonimizar" ? "Anonimizar cliente?" : "Excluir cliente?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lgpdModo === "anonimizar"
                ? `Os dados pessoais de ${client?.name} serão apagados (nome, CPF, e-mail, telefone). Documentos e chats do caso também saem. Os processos permanecem sem identificação.`
                : `Isso apaga ${client?.name} e todos os casos, documentos e prazos vinculados. Não dá para desfazer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={lgpdBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={lgpdModo === "excluir" ? "bg-destructive text-white hover:bg-destructive/90" : ""}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmLgpd()
              }}
            >
              {lgpdBusy ? "Aguarde..." : lgpdModo === "anonimizar" ? "Anonimizar" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
