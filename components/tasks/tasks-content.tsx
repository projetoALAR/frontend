"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, Calendar, Tag, Eye, Loader2, Trash2 } from "lucide-react"
import { useState, useEffect, useCallback, forwardRef } from "react"
import { CaseModal } from "./case-modal"
import { FilterModal, type FilterOptions } from "./filter-modal"
import { CasePanel } from "./case-panel"
import { processosApi, type ProcessoFormData } from "@/lib/processos-api"
import { mapProcessoToCase, type CaseView } from "@/lib/processo-mapper"
import { useToast } from "@/hooks/use-toast"

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
  const [allTasks, setAllTasks] = useState<CaseView[]>([])
  const [filter, setFilter] = useState(initialFilter)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseView | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({ priorities: [] })
  const [checkedCases, setCheckedCases] = useState<string[]>([])
  const [panelCase, setPanelCase] = useState<CaseView | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
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
    const handleOpenNewCase = () => {
      setSelectedCase(null)
      setIsCaseModalOpen(true)
    }
    window.addEventListener("openNewCaseModal", handleOpenNewCase)
    return () => window.removeEventListener("openNewCaseModal", handleOpenNewCase)
  }, [])

  const filteredTasks = allTasks.filter((task) => {
    let statusMatch = true
    if (filter === "concluidas") statusMatch = task.completed
    else if (filter === "ativas") statusMatch = !task.completed

    const searchMatch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.cliente?.nome ?? "").toLowerCase().includes(searchTerm.toLowerCase())

    let filterMatch = true
    if (filters.priorities.length > 0) {
      filterMatch = filters.priorities.includes(task.priority)
    }

    let dateMatch = true
    if ((dateRange.start || dateRange.end) && task.dueDateIso) {
      const taskDate = new Date(task.dueDateIso)
      if (dateRange.start) dateMatch = dateMatch && taskDate >= new Date(dateRange.start)
      if (dateRange.end) dateMatch = dateMatch && taskDate <= new Date(`${dateRange.end}T23:59:59`)
    }

    return statusMatch && searchMatch && filterMatch && dateMatch
  })

  const handleSaveCase = async (data: ProcessoFormData) => {
    if (selectedCase) {
      const updated = await processosApi.atualizar(selectedCase.id, data)
      const mapped = mapProcessoToCase(updated)
      setAllTasks((prev) => prev.map((t) => (t.id === selectedCase.id ? mapped : t)))
      if (panelCase?.id === selectedCase.id) setPanelCase(mapped)
    } else {
      const created = await processosApi.criar(data)
      setAllTasks((prev) => [mapProcessoToCase(created), ...prev])
    }
    setSelectedCase(null)
  }

  const handleCaseUpdated = (updated: CaseView) => {
    setAllTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setPanelCase(updated)
  }

  const handleDeleteChecked = async () => {
    if (checkedCases.length === 0) return
    try {
      await Promise.all(checkedCases.map((id) => processosApi.remover(id)))
      setAllTasks((prev) => prev.filter((t) => !checkedCases.includes(t.id)))
      setCheckedCases([])
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
          {checkedCases.length > 0 && (
            <Button variant="destructive" className="gap-2" onClick={() => void handleDeleteChecked()}>
              <Trash2 className="w-4 h-4" />
              Excluir ({checkedCases.length})
            </Button>
          )}
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsDateFilterOpen(true)}>
            <Calendar className="w-4 h-4" />
            Data {dateRange.start && `(${dateRange.start})`}
          </Button>
        </div>
      </div>

      {isDateFilterOpen && (
        <div className="p-4 bg-secondary rounded-lg border border-border space-y-3 animate-slide-in-up">
          <div>
            <Label htmlFor="start-date" className="text-sm">Data Inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="text-sm">Data Final</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => {
                setDateRange({ start: "", end: "" })
                setIsDateFilterOpen(false)
              }}
            >
              Limpar
            </Button>
            <Button size="sm" className="flex-1" onClick={() => setIsDateFilterOpen(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => handleSetFilter("all")} size="sm" className={filter !== "all" ? "bg-transparent" : ""}>
          Todas ({allTasks.length})
        </Button>
        <Button variant={filter === "ativas" ? "default" : "outline"} onClick={() => handleSetFilter("ativas")} size="sm" className={filter !== "ativas" ? "bg-transparent" : ""}>
          Ativas ({allTasks.filter((t) => !t.completed).length})
        </Button>
        <Button variant={filter === "concluidas" ? "default" : "outline"} onClick={() => handleSetFilter("concluidas")} size="sm" className={filter !== "concluidas" ? "bg-transparent" : ""}>
          Concluídas ({allTasks.filter((t) => t.completed).length})
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Carregando casos...
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => (
            <Card
              key={task.id}
              className="p-4 hover:shadow-lg transition-all duration-300 animate-slide-in-up group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={checkedCases.includes(task.id)}
                  onCheckedChange={() => toggleCaseCheck(task.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`font-semibold text-foreground ${task.completed ? "line-through opacity-60" : ""}`}>
                      {task.title}
                    </h3>
                    <Badge variant={priorityVariant[task.priority] ?? "secondary"} className="shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {task.project}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {task.dueDate}
                    </span>
                    <span>{task.numero}</span>
                    {task.cliente?.nome && <span>{task.cliente.nome}</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setPanelCase(task)
                    setIsPanelOpen(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          {filteredTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum caso encontrado</p>
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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        currentFilters={filters}
      />

      <CasePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        caseData={panelCase}
        onUpdated={handleCaseUpdated}
      />
    </div>
  )
})
