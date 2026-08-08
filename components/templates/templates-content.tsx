"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"
import {
  CATEGORIAS_MODELO,
  modelosDocumentoApi,
  type ModeloDocumentoApi,
  type ModeloDocumentoFormData,
} from "@/lib/modelos-documento-api"
import { TemplateModal } from "./template-modal"

export function TemplatesContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)

  const [modelos, setModelos] = useState<ModeloDocumentoApi[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selected, setSelected] = useState<ModeloDocumentoApi | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadModelos = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await modelosDocumentoApi.listar()
      setModelos(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar modelos",
        description:
          error instanceof Error ? error.message : "Não foi possível buscar os modelos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadModelos()
  }, [loadModelos])

  const filtrados = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return modelos.filter((m) => {
      const catOk =
        categoriaFiltro === "todas" || m.categoria === categoriaFiltro
      const termOk =
        !term ||
        m.nome.toLowerCase().includes(term) ||
        m.conteudo.toLowerCase().includes(term) ||
        m.categoria.toLowerCase().includes(term)
      return catOk && termOk
    })
  }, [modelos, searchTerm, categoriaFiltro])

  const agrupados = useMemo(() => {
    const map = new Map<string, ModeloDocumentoApi[]>()
    for (const m of filtrados) {
      const lista = map.get(m.categoria) ?? []
      lista.push(m)
      map.set(m.categoria, lista)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
  }, [filtrados])

  const handleSave = async (data: ModeloDocumentoFormData) => {
    if (selected) {
      const updated = await modelosDocumentoApi.atualizar(selected.id, data)
      setModelos((prev) => prev.map((m) => (m.id === selected.id ? updated : m)))
    } else {
      const created = await modelosDocumentoApi.criar(data)
      setModelos((prev) => [created, ...prev])
    }
    setSelected(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Excluir este modelo? Esta ação não pode ser desfeita.")) {
      return
    }
    setDeletingId(id)
    try {
      await modelosDocumentoApi.remover(id)
      setModelos((prev) => prev.filter((m) => m.id !== id))
      toast({ title: "Modelo removido" })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description:
          error instanceof Error ? error.message : "Não foi possível excluir o modelo",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou conteúdo..."
              className="pl-9"
            />
          </div>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {CATEGORIAS_MODELO.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button
            onClick={() => {
              setSelected(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Novo modelo
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : agrupados.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhum modelo encontrado.{" "}
          {canWrite ? "Crie o primeiro com “Novo modelo”." : ""}
        </Card>
      ) : (
        <div className="space-y-6">
          {agrupados.map(([categoria, itens]) => (
            <section key={categoria} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {categoria}
                </h3>
                <Badge variant="secondary">{itens.length}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {itens.map((modelo) => (
                  <Card key={modelo.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{modelo.nome}</p>
                          <p className="text-xs text-muted-foreground line-clamp-3 mt-1 whitespace-pre-wrap">
                            {modelo.conteudo.slice(0, 180)}
                            {modelo.conteudo.length > 180 ? "…" : ""}
                          </p>
                        </div>
                      </div>
                      {canWrite && (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelected(modelo)
                              setIsModalOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            disabled={deletingId === modelo.id}
                            onClick={() => void handleDelete(modelo.id)}
                          >
                            {deletingId === modelo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelected(null)
        }}
        onSave={handleSave}
        modelo={selected}
        isEditing={!!selected}
      />
    </div>
  )
}
