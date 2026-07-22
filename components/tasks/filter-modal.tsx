"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export interface FilterOptions {
  priorities: string[]
  dateRange?: { from: string; to: string }
}

export function FilterModal({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(currentFilters.priorities || [])
  const [dateFrom, setDateFrom] = useState(currentFilters.dateRange?.from || "")
  const [dateTo, setDateTo] = useState(currentFilters.dateRange?.to || "")

  const priorities = ["Alta", "Média", "Baixa"]

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const handleApply = () => {
    onApply({
      priorities: selectedPriorities,
      dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined,
    })
    onClose()
  }

  const handleReset = () => {
    setSelectedPriorities([])
    setDateFrom("")
    setDateTo("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Casos</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-3">Prioridade</h3>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <div key={priority} className="flex items-center gap-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={selectedPriorities.includes(priority)}
                    onCheckedChange={() => togglePriority(priority)}
                  />
                  <Label htmlFor={`priority-${priority}`} className="cursor-pointer">
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Data de Vencimento</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="date-from">De</Label>
                <input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full mt-1 px-3 py-1 rounded-md border border-input bg-transparent"
                />
              </div>
              <div>
                <Label htmlFor="date-to">Até</Label>
                <input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full mt-1 px-3 py-1 rounded-md border border-input bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} className="bg-transparent">
            Limpar
          </Button>
          <Button variant="outline" onClick={onClose} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90">
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
