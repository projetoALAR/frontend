"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useMemo, useState } from "react"
import { PROCESSO_STATUS_OPTIONS } from "@/lib/processo-status"

export interface FilterOptions {
  statuses: string[]
  priorities: string[]
  dateRange?: { from: string; to: string }
}

export const EMPTY_FILTERS: FilterOptions = {
  statuses: [],
  priorities: [],
}

const PRIORITIES = ["Alta", "Média", "Baixa"] as const

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
  /** Status extras encontrados nos casos (legado). */
  extraStatuses?: string[]
}

export function countActiveFilters(filters: FilterOptions): number {
  let n = filters.statuses.length + filters.priorities.length
  if (filters.dateRange?.from || filters.dateRange?.to) n += 1
  return n
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
  extraStatuses = [],
}: FilterModalProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const statusOptions = useMemo(() => {
    const extras = extraStatuses.filter(
      (s) => s.trim() && !(PROCESSO_STATUS_OPTIONS as readonly string[]).includes(s),
    )
    return [...PROCESSO_STATUS_OPTIONS, ...extras]
  }, [extraStatuses])

  useEffect(() => {
    if (!isOpen) return
    setSelectedStatuses(currentFilters.statuses ?? [])
    setSelectedPriorities(currentFilters.priorities ?? [])
    setDateFrom(currentFilters.dateRange?.from || "")
    setDateTo(currentFilters.dateRange?.to || "")
  }, [isOpen, currentFilters])

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const handleApply = () => {
    onApply({
      statuses: selectedStatuses,
      priorities: selectedPriorities,
      dateRange:
        dateFrom || dateTo
          ? { from: dateFrom, to: dateTo }
          : undefined,
    })
    onClose()
  }

  const handleReset = () => {
    setSelectedStatuses([])
    setSelectedPriorities([])
    setDateFrom("")
    setDateTo("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrar casos</DialogTitle>
          <DialogDescription>
            Combine status, prioridade e prazo. Sem seleção = mostrar todos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Status do caso</h3>
              <p className="text-xs text-muted-foreground">Situação processual atual</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-2">
                  <Checkbox
                    id={`filter-status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggle(selectedStatuses, status, setSelectedStatuses)}
                  />
                  <Label htmlFor={`filter-status-${status}`} className="cursor-pointer text-sm font-normal">
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Prioridade</h3>
              <p className="text-xs text-muted-foreground">Urgência do caso</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((priority) => (
                <div key={priority} className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-2">
                  <Checkbox
                    id={`filter-priority-${priority}`}
                    checked={selectedPriorities.includes(priority)}
                    onCheckedChange={() => toggle(selectedPriorities, priority, setSelectedPriorities)}
                  />
                  <Label htmlFor={`filter-priority-${priority}`} className="cursor-pointer text-sm font-normal">
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm">Prazo</h3>
              <p className="text-xs text-muted-foreground">Filtrar pela data de vencimento</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="filter-date-from">De</Label>
                <Input
                  id="filter-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filter-date-to">Até</Label>
                <Input
                  id="filter-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={handleReset} className="bg-transparent">
            Limpar tudo
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
            Cancelar
          </Button>
          <Button type="button" onClick={handleApply} className="bg-primary hover:bg-primary/90">
            Aplicar filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
