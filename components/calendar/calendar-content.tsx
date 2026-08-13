"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit2, Trash2, Calendar } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { EventModal, type CalendarEventView } from "./event-modal"
import { MonthYearPicker } from "./month-year-picker"
import { compromissosApi, type CompromissoFormData } from "@/lib/compromissos-api"
import { useToast } from "@/hooks/use-toast"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import { ListSkeleton } from "@/components/shared/list-skeleton"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function toEventView(c: {
  id: string
  titulo: string
  descricao: string | null
  dataHora: string
  processoId: string | null
}): CalendarEventView {
  return {
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    dataHora: c.dataHora,
    processoId: c.processoId,
  }
}

export function CalendarContent() {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [events, setEvents] = useState<CalendarEventView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEventView | null>(null)

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await compromissosApi.listar()
      setEvents(data.map(toEventView))
    } catch (error) {
      toast({
        title: "Erro ao carregar agenda",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const eventsForSelectedDay = useMemo(() => {
    return events.filter((event) => {
      const d = new Date(event.dataHora)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
    })
  }, [events, year, month, selectedDay])

  const daysWithEvents = useMemo(() => {
    const set = new Set<number>()
    events.forEach((event) => {
      const d = new Date(event.dataHora)
      if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate())
    })
    return set
  }, [events, year, month])

  const upcomingEvents = useMemo(() => {
    const agora = Date.now()
    return events
      .filter((event) => new Date(event.dataHora).getTime() >= agora)
      .sort(
        (a, b) =>
          new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
      )
      .slice(0, 5)
  }, [events])

  const goToEventDate = (event: CalendarEventView) => {
    const d = new Date(event.dataHora)
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1))
    setSelectedDay(d.getDate())
  }

  const handleSaveEvent = async (data: CompromissoFormData) => {
    if (editingEvent) {
      const updated = await compromissosApi.atualizar(editingEvent.id, data)
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? toEventView(updated) : e)))
    } else {
      const created = await compromissosApi.criar(data)
      setEvents((prev) => [...prev, toEventView(created)])
    }
    invalidateDashboardCache()
    setEditingEvent(null)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await compromissosApi.remover(eventId)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      invalidateDashboardCache()
      toast({ title: "Evento removido" })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    }
  }

  const monthLabel = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const hoje = new Date()
  const hojeNoMesVisivel =
    hoje.getFullYear() === year && hoje.getMonth() === month ? hoje.getDate() : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={() => setIsMonthPickerOpen(true)} className="capitalize min-w-0 flex-1 sm:flex-none sm:min-w-[160px]">
            {monthLabel}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null)
            setIsEventModalOpen(true)
          }}
        >
          + Novo Evento
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton variant="calendar" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <Card className="p-2 sm:p-4 overflow-x-auto">
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 min-w-[280px]">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 min-w-[280px]">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const selected = day === selectedDay
                  const isToday = hojeNoMesVisivel === day
                  const hasEvents = daysWithEvents.has(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      title={isToday ? "Hoje" : undefined}
                      className={`h-10 rounded-md text-sm relative transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                            ? "bg-sky-100 text-sky-900 font-semibold hover:bg-sky-200 dark:bg-sky-950/60 dark:text-sky-100 dark:hover:bg-sky-900/70"
                            : "hover:bg-secondary"
                      } ${selected && isToday ? "ring-2 ring-sky-300 ring-offset-1 ring-offset-background" : ""}`}
                    >
                      {day}
                      {hasEvents && (
                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${selected ? "bg-primary-foreground" : isToday ? "bg-sky-600 dark:bg-sky-300" : "bg-primary"}`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </Card>

            <div className="px-1">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Próximos eventos
              </p>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground/80 py-1">
                  Nenhum evento futuro
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {upcomingEvents.map((event) => {
                    const d = new Date(event.dataHora)
                    const isActive =
                      d.getFullYear() === year &&
                      d.getMonth() === month &&
                      d.getDate() === selectedDay
                    return (
                      <li key={event.id}>
                        <button
                          type="button"
                          onClick={() => goToEventDate(event)}
                          className={`w-full flex items-baseline gap-3 py-2 text-left text-sm transition-colors hover:text-primary ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          <span className="shrink-0 w-[7.5rem] text-xs text-muted-foreground tabular-nums">
                            {d.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                            {" · "}
                            {d.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="truncate font-medium">{event.titulo}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">
                {selectedDay}/{month + 1}/{year}
              </h3>
            </div>
            {eventsForSelectedDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento neste dia</p>
            ) : (
              eventsForSelectedDay.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{event.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.dataHora).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {event.descricao && (
                        <p className="text-xs text-muted-foreground mt-1">{event.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingEvent(event)
                          setIsEventModalOpen(true)
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => void handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary">Compromisso</Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setEditingEvent(null)
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
        isEditing={!!editingEvent}
      />

      <MonthYearPicker
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        currentDate={currentDate}
        onSelect={(date) => {
          setCurrentDate(date)
          setSelectedDay(1)
          setIsMonthPickerOpen(false)
        }}
      />
    </div>
  )
}
