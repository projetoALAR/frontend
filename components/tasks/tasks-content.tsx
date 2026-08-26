"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Tag, Eye, Trash2, Pencil, X, Calendar, Briefcase, FileSpreadsheet } from "lucide-react"
import { useState, useEffect, useCallback, forwardRef, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { FilterModal, countActiveFilters, EMPTY_FILTERS, type FilterOptions } from "./filter-modal"
import { processosApi, type ProcessoFormData } from "@/lib/processos-api"
import { mapProcessoToCase, type CaseView } from "@/lib/processo-mapper"
import { casoHref } from "@/lib/caso-href"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import { PROCESSO_STATUS_OPTIONS } from "@/lib/processo-status"
import { formatCnj } from "@/lib/masks"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { ListSkeleton } from "@/components/shared/list-skeleton"
import { cn } from "@/lib/utils"

const CaseModal = dynamic(() =>
  import("./case-modal").then((m) => m.CaseModal),
)
const CasesImportDialog = dynamic(() =>
  import("./cases-import-dialog").then((m) => m.CasesImportDialog),
)

const priorityVariant: Record<string, "destructive" | "default" | "secondary"> = {
  Alta: "destructive",
  Média: "default",
  Baixa: "secondary",
}

interface TasksContentProps {
  initialFilter?: string
  onFilterChange?: (filter: string) => void
}

export const TasksContent = forwardRef<HTMLDivElement, TasksContentProps>(function TasksContent(
  { initialFilter = "all", onFilterChange },
  ref,
) {
  const { toast } = useToast()
  const { user } = useAuth()
  const canWrite = canWriteClientesProcessos(user?.role)
  const [allTasks, setAllTasks] = useState<CaseView[]>([])
  const [filter, setFilter] = useState(initialFilter)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseView | null>(null)
  const [filters, setFilters] = useState<FilterOptions>(EMPTY_FILTERS)
  const [checkedCases, setCheckedCases] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [debouncedQ, setDebouncedQ] = useState("")
  const PAGE_SIZE = 12
  const activeFilterCount = countActiveFilters(filters)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchTerm.trim()), 300)
    return () => window.clearTimeout(t)
  }, [searchTerm])

  const loadTasks = useCallback(async (force = false) => {
    setIsLoading(true)
    try {
      const situacao =
        filter === "concluidas"
          ? "concluidos"
          : filter === "ativas"
            ? "ativos"
            : undefined
      const data = await processosApi.listarPagina(
        {
          page,
          limit: PAGE_SIZE,
          q: debouncedQ || undefined,
          situacao,
          status: filters.statuses.length > 0 ? filters.statuses : undefined,
          prioridade:
            filters.priorities.length > 0 ? filters.priorities : undefined,
          prazoDe: filters.dateRange?.from || undefined,
          prazoAte: filters.dateRange?.to || undefined,
        },
        { force },
      )
      setAllTasks(data.items.map(mapProcessoToCase))
      setTotal(data.total)
    } catch (error) {
      toast({
        title: "Erro ao carregar casos",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, filter, page, debouncedQ, filters])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, filter, filters])

  const handleSetFilter = (newFilter: string) => {
    setFilter(newFilter)
    onFilterChange?.(newFilter)
  }

  useEffect(() => {
    if (!canWrite) return
    const handleOpenNewCase = () => {
      setSelectedCase(null)
      setIsCaseModalOpen(true)
    }
    const handleOpenImport = () => setIsImportOpen(true)
    window.addEventListener("openNewCaseModal", handleOpenNewCase)
    window.addEventListener("openImportCasesModal", handleOpenImport)
    return () => {
      window.removeEventListener("openNewCaseModal", handleOpenNewCase)
      window.removeEventListener("openImportCasesModal", handleOpenImport)
    }
  }, [canWrite])

  const extraStatuses = useMemo(() => {
    const known = new Set<string>(PROCESSO_STATUS_OPTIONS)
    return Array.from(
      new Set(
        allTasks
          .map((t) => t.status || t.project)
          .filter((s) => s && !known.has(s)),
      ),
    )
  }, [allTasks])

  const filteredTasks = allTasks

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)

  const handleSaveCase = async (data: ProcessoFormData) => {
    if (selectedCase) {
      await processosApi.atualizar(selectedCase.id, data)
    } else {
      await processosApi.criar(data)
    }
    invalidateDashboardCache()
    setSelectedCase(null)
    await loadTasks(true)
  }

  const handleDeleteChecked = async () => {
    if (checkedCases.length === 0) return
    try {
      await Promise.all(checkedCases.map((id) => processosApi.remover(id)))
      setCheckedCases([])
      invalidateDashboardCache()
      toast({ title: "Casos removidos", description: "Seleção excluída com sucesso" })
      await loadTasks(true)
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const toggleCaseCheck = (caseId: string) => {
    setCheckedCases((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId],
    )
  }

  return (
    <div ref={ref} className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar casos ou clientes..."
            className="h-10 border-border/80 bg-card pl-9 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {canWrite && checkedCases.length > 0 && (
            <Button variant="destructive" className="gap-2 h-10" onClick={() => void handleDeleteChecked()}>
              <Trash2 className="w-4 h-4" />
              Excluir ({checkedCases.length})
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 h-10 border-border/80 bg-card shadow-none"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter className="w-4 h-4" />
            Filtrar
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div
        className="inline-flex max-w-full flex-wrap items-center rounded-lg border border-border/70 bg-card p-1"
        role="group"
        aria-label="Situação dos casos"
      >
        {(
          [
            { id: "all", label: "Todas" },
            { id: "ativas", label: "Em aberto" },
            { id: "concluidas", label: "Concluídas" },
          ] as const
        ).map((opt) => (
          <Button
            key={opt.id}
            variant={filter === opt.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleSetFilter(opt.id)}
            className={cn(
              "h-8 rounded-md px-3 text-xs font-medium shadow-none",
              filter === opt.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtros:</span>
          {filters.statuses.map((status) => (
            <Badge key={`st-${status}`} variant="secondary" className="gap-1 pr-1 font-normal">
              {status}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remover filtro ${status}`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    statuses: prev.statuses.filter((s) => s !== status),
                  }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.priorities.map((priority) => (
            <Badge key={`pr-${priority}`} variant="secondary" className="gap-1 pr-1 font-normal">
              Prioridade: {priority}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remover prioridade ${priority}`}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    priorities: prev.priorities.filter((p) => p !== priority),
                  }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {(filters.dateRange?.from || filters.dateRange?.to) && (
            <Badge variant="secondary" className="gap-1 pr-1 font-normal">
              Prazo
              {filters.dateRange.from ? ` de ${filters.dateRange.from}` : ""}
              {filters.dateRange.to ? ` até ${filters.dateRange.to}` : ""}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label="Remover filtro de prazo"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: undefined,
                  }))
                }
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Limpar
          </Button>
        </div>
      )}

      {isLoading && allTasks.length === 0 ? (
        <ListSkeleton variant="rows" count={5} />
      ) : (
        <div className={cn("space-y-2", isLoading && "opacity-60 pointer-events-none")}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="surface-row group flex items-start gap-3 p-3.5 sm:gap-4 sm:p-4"
            >
              {canWrite && (
                <Checkbox
                  checked={checkedCases.includes(task.id)}
                  onCheckedChange={() => toggleCaseCheck(task.id)}
                  className="mt-1 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug text-foreground">
                    <Link
                      href={casoHref(task.id)}
                      className="hover:text-primary transition-colors"
                    >
                      {task.title}
                    </Link>
                  </h3>
                  <Badge
                    variant={priorityVariant[task.priority] ?? "secondary"}
                    className="shrink-0 font-normal"
                  >
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                  <span className="flex items-center gap-1 min-w-0">
                    <Tag className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{task.project}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    {task.dueDate}
                  </span>
                  <span className="break-all font-mono text-[11px] sm:text-xs opacity-90">
                    {formatCnj(task.numero)}
                  </span>
                  {task.cliente?.nome && (
                    <span className="truncate max-w-full">{task.cliente.nome}</span>
                  )}
                </div>
                {task.tags.length > 0 ? (
                  <div className="flex gap-1.5 flex-wrap pt-0.5">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] font-normal border-border/80">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                {canWrite && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="min-h-9 min-w-9 text-muted-foreground"
                    aria-label={`Editar caso ${task.title}`}
                    onClick={() => {
                      setSelectedCase(task)
                      setIsCaseModalOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-9 min-w-9 text-muted-foreground"
                  aria-label={`Ver detalhes de ${task.title}`}
                  asChild
                >
                  <Link href={casoHref(task.id)}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && !isLoading && (
            allTasks.length === 0 && !searchTerm && filter === "all" && activeFilterCount === 0 ? (
              <ListEmptyState
                icon={Briefcase}
                title="Nenhum caso ainda"
                description="Crie o primeiro caso ou importe um CSV após cadastrar os clientes. Acompanhe prazos, checklist, documentos, timeline e andamentos."
              >
                {canWrite && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Importar
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedCase(null)
                        setIsCaseModalOpen(true)
                      }}
                    >
                      + Novo caso
                    </Button>
                  </div>
                )}
              </ListEmptyState>
            ) : (
              <ListEmptyState
                icon={Briefcase}
                title="Nenhum caso encontrado"
                description="Ajuste a busca ou os filtros para ver outros resultados."
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilters(EMPTY_FILTERS)
                    handleSetFilter("all")
                  }}
                >
                  Limpar busca e filtros
                </Button>
              </ListEmptyState>
            )
          )}
        </div>
      )}

      {!isLoading && total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {total} caso(s) · página {pageSafe} de {totalPages}
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

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false)
          setSelectedCase(null)
        }}
        onSave={handleSaveCase}
        caseData={selectedCase}
        isEditing={!!selectedCase}
      />

      <CasesImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImported={() => {
          invalidateDashboardCache()
          void loadTasks()
        }}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={setFilters}
        currentFilters={filters}
        extraStatuses={extraStatuses}
      />
    </div>
  )
})
