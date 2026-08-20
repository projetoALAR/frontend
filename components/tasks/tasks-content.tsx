"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Tag, Eye, Trash2, Pencil, X, Calendar, Briefcase, FileSpreadsheet } from "lucide-react"
import { useState, useEffect, useCallback, forwardRef, useMemo } from "react"
import Link from "next/link"
import { CaseModal } from "./case-modal"
import { CasesImportDialog } from "./cases-import-dialog"
import { FilterModal, countActiveFilters, EMPTY_FILTERS, type FilterOptions } from "./filter-modal"
import { processosApi, type ProcessoFormData } from "@/lib/processos-api"
import { mapProcessoToCase, type CaseView } from "@/lib/processo-mapper"
import { casoHref } from "@/lib/caso-href"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { canWriteClientesProcessos } from "@/lib/roles"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import { PROCESSO_STATUS_OPTIONS } from "@/lib/processo-status"
import { formatCnj, onlyDigits } from "@/lib/masks"
import { ListEmptyState } from "@/components/shared/list-empty-state"
import { ListSkeleton } from "@/components/shared/list-skeleton"

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

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await processosApi.listar()
      setAllTasks(data.map(mapProcessoToCase))
    } catch (error) {
      toast({
        title: "Erro ao carregar casos",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  useEffect(() => {
    setFilter(initialFilter)
  }, [initialFilter])

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

  const activeFilterCount = countActiveFilters(filters)

  const filteredTasks = allTasks.filter((task) => {
    let situacaoMatch = true
    if (filter === "concluidas") situacaoMatch = task.completed
    else if (filter === "ativas") situacaoMatch = !task.completed

    const term = searchTerm.toLowerCase()
    const termDigits = onlyDigits(searchTerm)
    const searchMatch =
      task.title.toLowerCase().includes(term) ||
      task.project.toLowerCase().includes(term) ||
      task.numero.toLowerCase().includes(term) ||
      (termDigits.length >= 4 && onlyDigits(task.numero).includes(termDigits)) ||
      (task.cliente?.nome ?? "").toLowerCase().includes(term)

    let statusMatch = true
    if (filters.statuses.length > 0) {
      statusMatch = filters.statuses.includes(task.status || task.project)
    }

    let priorityMatch = true
    if (filters.priorities.length > 0) {
      priorityMatch = filters.priorities.includes(task.priority)
    }

    let dateMatch = true
    const start = filters.dateRange?.from || ""
    const end = filters.dateRange?.to || ""
    if ((start || end) && task.dueDateIso) {
      const taskDate = new Date(task.dueDateIso)
      if (start) dateMatch = dateMatch && taskDate >= new Date(start)
      if (end) dateMatch = dateMatch && taskDate <= new Date(`${end}T23:59:59`)
    } else if ((start || end) && !task.dueDateIso) {
      dateMatch = false
    }

    return situacaoMatch && searchMatch && statusMatch && priorityMatch && dateMatch
  })

  const handleSaveCase = async (data: ProcessoFormData) => {
    if (selectedCase) {
      const updated = await processosApi.atualizar(selectedCase.id, data)
      const mapped = mapProcessoToCase(updated)
      setAllTasks((prev) => prev.map((t) => (t.id === selectedCase.id ? mapped : t)))
    } else {
      const created = await processosApi.criar(data)
      setAllTasks((prev) => [mapProcessoToCase(created), ...prev])
    }
    invalidateDashboardCache()
    setSelectedCase(null)
  }

  const handleDeleteChecked = async () => {
    if (checkedCases.length === 0) return
    try {
      await Promise.all(checkedCases.map((id) => processosApi.remover(id)))
      setAllTasks((prev) => prev.filter((t) => !checkedCases.includes(t.id)))
      setCheckedCases([])
      invalidateDashboardCache()
      toast({ title: "Casos removidos", description: "Seleção excluída com sucesso" })
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
    <div ref={ref} className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar casos ou clientes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {canWrite && checkedCases.length > 0 && (
            <Button variant="destructive" className="gap-2" onClick={() => void handleDeleteChecked()}>
              <Trash2 className="w-4 h-4" />
              Excluir ({checkedCases.length})
            </Button>
          )}
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="w-4 h-4" />
            Filtrar
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-0.5 h-5 min-w-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Situação:</span>
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => handleSetFilter("all")} size="sm" className={filter !== "all" ? "bg-transparent" : ""}>
          Todas ({allTasks.length})
        </Button>
        <Button variant={filter === "ativas" ? "default" : "outline"} onClick={() => handleSetFilter("ativas")} size="sm" className={filter !== "ativas" ? "bg-transparent" : ""}>
          Em aberto ({allTasks.filter((t) => !t.completed).length})
        </Button>
        <Button variant={filter === "concluidas" ? "default" : "outline"} onClick={() => handleSetFilter("concluidas")} size="sm" className={filter !== "concluidas" ? "bg-transparent" : ""}>
          Concluídas ({allTasks.filter((t) => t.completed).length})
        </Button>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtros ativos:</span>
          {filters.statuses.map((status) => (
            <Badge key={`st-${status}`} variant="secondary" className="gap-1 pr-1">
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
            <Badge key={`pr-${priority}`} variant="secondary" className="gap-1 pr-1">
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
            <Badge variant="secondary" className="gap-1 pr-1">
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
            Limpar filtros
          </Button>
        </div>
      )}

      {isLoading ? (
        <ListSkeleton variant="rows" count={5} />
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => (
            <Card
              key={task.id}
              className="p-3 sm:p-4 hover:shadow-lg transition-all duration-300 animate-slide-in-up group overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {canWrite && (
                  <Checkbox
                    checked={checkedCases.includes(task.id)}
                    onCheckedChange={() => toggleCaseCheck(task.id)}
                    className="mt-1 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground break-words">
                      <Link href={casoHref(task.id)} className="hover:underline">
                        {task.title}
                      </Link>
                    </h3>
                    <Badge variant={priorityVariant[task.priority] ?? "secondary"} className="shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 min-w-0">
                      <Tag className="w-4 h-4 shrink-0" />
                      <span className="truncate">{task.project}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 shrink-0" />
                      {task.dueDate}
                    </span>
                    <span className="break-all font-mono">{formatCnj(task.numero)}</span>
                    {task.cliente?.nome && <span className="truncate max-w-full">{task.cliente.nome}</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {canWrite && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="min-h-10 min-w-10 bg-transparent"
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
                    variant="outline"
                    className="min-h-10 min-w-10 bg-transparent"
                    aria-label={`Ver detalhes de ${task.title}`}
                    asChild
                  >
                    <Link href={casoHref(task.id)}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
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
              <p className="text-center text-muted-foreground py-8">Nenhum caso encontrado</p>
            )
          )}
        </div>
      )}

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
