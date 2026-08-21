"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Loader2,
  Pencil,
  Plus,
  Scale,
  ScrollText,
  Search,
  Trash2,
  FileSignature,
  Bell,
  Gavel,
  Files,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
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
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { cn } from "@/lib/utils"
import { formatDatePt } from "@/lib/format"

const CATEGORIA_ICONE: Record<string, LucideIcon> = {
  Petição: Scale,
  Contrato: FileSignature,
  Procuração: ScrollText,
  Notificação: Bell,
  Recurso: Gavel,
  Outro: Files,
}

function previewTexto(conteudo: string, max = 140) {
  const limpo = conteudo.replace(/\s+/g, " ").trim()
  if (limpo.length <= max) return limpo
  return `${limpo.slice(0, max).trimEnd()}…`
}

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

  const openEdit = (modelo: ModeloDocumentoApi) => {
    setSelected(modelo)
    setIsModalOpen(true)
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

  const filtros = [
    { id: "todas", label: "Todos" },
    ...CATEGORIAS_MODELO.map((cat) => ({ id: cat, label: cat })),
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar modelos…"
              className="h-10 border-border/80 bg-card pl-9 shadow-none"
              aria-label="Buscar modelos"
            />
          </div>
          {canWrite ? (
            <Button
              className="h-10 shrink-0"
              onClick={() => {
                setSelected(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Novo modelo
            </Button>
          ) : null}
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filtrar por categoria"
        >
          {filtros.map((f) => {
            const ativo = categoriaFiltro === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setCategoriaFiltro(f.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton variant="cards" count={6} />
      ) : agrupados.length === 0 ? (
        <ListEmptyState
          icon={FileText}
          title={
            modelos.length === 0
              ? "Nenhum modelo ainda"
              : "Nenhum modelo encontrado"
          }
          description={
            modelos.length === 0
              ? "Crie petições, contratos e procurações para reutilizar com dados do cliente e do caso."
              : "Ajuste a busca ou a categoria para ver outros resultados."
          }
        >
          {canWrite && modelos.length === 0 ? (
            <Button
              onClick={() => {
                setSelected(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Criar primeiro modelo
            </Button>
          ) : searchTerm || categoriaFiltro !== "todas" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setCategoriaFiltro("todas")
              }}
            >
              Limpar filtros
            </Button>
          ) : null}
        </ListEmptyState>
      ) : (
        <div className="space-y-8">
          {agrupados.map(([categoria, itens]) => {
            const Icon = CATEGORIA_ICONE[categoria] ?? FileText
            return (
              <section key={categoria} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-primary/80" aria-hidden />
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    {categoria}
                  </h2>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {itens.length}
                  </span>
                  <div className="ml-1 h-px flex-1 bg-border/80" />
                </div>

                <ul className="grid gap-3 sm:grid-cols-2">
                  {itens.map((modelo) => (
                    <li key={modelo.id}>
                      <article
                        className={cn(
                          "group relative flex h-full flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm",
                          "transition-shadow hover:shadow-md",
                          canWrite && "cursor-pointer",
                        )}
                        onClick={() => {
                          if (canWrite) openEdit(modelo)
                        }}
                        onKeyDown={(e) => {
                          if (!canWrite) return
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            openEdit(modelo)
                          }
                        }}
                        role={canWrite ? "button" : undefined}
                        tabIndex={canWrite ? 0 : undefined}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[15px] font-medium leading-snug text-foreground">
                              {modelo.nome}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                              {previewTexto(modelo.conteudo)}
                            </p>
                          </div>
                          {canWrite ? (
                            <div
                              className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground"
                                aria-label={`Editar ${modelo.nome}`}
                                onClick={() => openEdit(modelo)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label={`Excluir ${modelo.nome}`}
                                disabled={deletingId === modelo.id}
                                onClick={() => void handleDelete(modelo.id)}
                              >
                                {deletingId === modelo.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                        <p className="mt-auto pt-3 text-xs text-muted-foreground/80">
                          Atualizado {formatDatePt(modelo.atualizadoEm)}
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
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
