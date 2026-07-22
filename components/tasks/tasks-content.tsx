"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Calendar, Tag, Eye } from "lucide-react"
import { useState, useEffect, forwardRef } from "react"
import { CaseModal } from "./case-modal"
import { FilterModal, type FilterOptions } from "./filter-modal"
import { CasePanel } from "./case-panel"

import { casesData } from "@/lib/shared-data"

const tasks = casesData.map(({ id, title, project, priority, dueDate, completed, tags }) => ({
  id,
  title,
  project,
  priority,
  dueDate,
  completed,
  tags,
}))

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
  const [allTasks, setAllTasks] = useState(tasks)
  const [filter, setFilter] = useState(initialFilter)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [filters, setFilters] = useState<FilterOptions>({ priorities: [] })
  const [checkedCases, setCheckedCases] = useState<number[]>([])
  const [panelCase, setPanelCase] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

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
    // Aplicar filtro de status
    let statusMatch = true
    if (filter === "concluidas") statusMatch = task.completed
    else if (filter === "ativas") statusMatch = !task.completed

    // Aplicar filtro de busca
    const searchMatch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase())

    // Aplicar filtros avançados
    let filterMatch = true
    if (filters.priorities.length > 0) {
      filterMatch = filters.priorities.includes(task.priority)
    }

    // Aplicar filtro de data
    let dateMatch = true
    if (dateRange.start || dateRange.end) {
      const taskDate = new Date(task.dueDate)
      if (dateRange.start) {
        dateMatch = dateMatch && taskDate >= new Date(dateRange.start)
      }
      if (dateRange.end) {
        dateMatch = dateMatch && taskDate <= new Date(dateRange.end)
      }
    }

    return statusMatch && searchMatch && filterMatch && dateMatch
  })

  const handleSaveCase = (newCase: any) => {
    if (selectedCase) {
      setAllTasks(allTasks.map((t) => (t.id === selectedCase.id ? newCase : t)))
    } else {
      setAllTasks([...allTasks, newCase])
    }
    setSelectedCase(null)
  }

  const toggleCaseCheck = (caseId: number) => {
    setCheckedCases((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    )
  }

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsFilterModalOpen(true)}>
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsDateFilterOpen(true)}>
            <Calendar className="w-4 h-4" />
            Data {dateRange.start && `(${dateRange.start})`}
          </Button>
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
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => setIsDateFilterOpen(false)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => handleSetFilter("all")} size="sm" className={filter !== "all" ? "bg-transparent" : ""}>
          Todas ({allTasks.length})
        </Button>
        <Button variant={filter === "ativas" ? "default" : "outline"} onClick={() => handleSetFilter("ativas")} size="sm" className={filter !== "ativas" ? "bg-transparent" : ""}>
          Ativas ({allTasks.filter((t) => !t.completed).length})
        </Button>
        <Button
          variant={filter === "concluidas" ? "default" : "outline"}
          onClick={() => handleSetFilter("concluidas")}
          size="sm"
          className={filter !== "concluidas" ? "bg-transparent" : ""}
        >
          Concluídas ({allTasks.filter((t) => t.completed).length})
        </Button>
      </div>

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
                  <Badge variant={priorityVariant[task.priority]} className="shrink-0">
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
                </div>
                <div className="flex gap-2">
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
                onClick={() => { setPanelCase(task); setIsPanelOpen(true) }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onSave={handleSaveCase}
        caseData={selectedCase}
        isEditing={!!selectedCase}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />

      <CasePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        caseData={panelCase}
      />
    </div>
  )
})
