"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Briefcase, Edit2, Trash2, Calendar } from "lucide-react"
import { useState } from "react"
import { EventModal } from "./event-modal"
import { MonthYearPicker } from "./month-year-picker"
import { casesData } from "@/lib/shared-data"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// Converte a dueDate "24 Nov, 2025" para um objeto { day, month, year }
function parseDueDate(dueDate: string): { day: number; month: number; year: number } | null {
  const monthMap: Record<string, number> = {
    Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
    Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
  }
  const parts = dueDate.replace(",", "").split(" ")
  if (parts.length < 3) return null
  const day = parseInt(parts[0], 10)
  const month = monthMap[parts[1]]
  const year = parseInt(parts[2], 10)
  if (isNaN(day) || month === undefined || isNaN(year)) return null
  return { day, month, year }
}

// Gera eventos iniciais a partir dos casos cadastrados
function buildInitialEvents() {
  const colorMap: Record<string, string> = {
    Alta: "bg-destructive",
    Média: "bg-primary",
    Baixa: "bg-blue-400",
  }
  return casesData.map((c, i) => ({
    id: i + 1,
    title: c.title,
    time: "09h00",
    duration: c.dueDate,
    type: c.completed ? "review" : "deadline",
    color: colorMap[c.priority] ?? "bg-primary",
    dueDate: c.dueDate,
    parsedDate: parseDueDate(c.dueDate),
  }))
}

export function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [events, setEvents] = useState(buildInitialEvents)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  const today = new Date().getDate()
  const currentMonth = new Date().getMonth()

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleSelectDay = (day: number) => {
    setSelectedDay(day)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setIsEventModalOpen(true)
  }

  const handleDeleteEvent = (eventId: number) => {
    setEvents(events.filter((e) => e.id !== eventId))
  }

  const handleSaveEvent = (newEvent: any) => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === editingEvent.id ? { ...newEvent, parsedDate: parseDueDate(newEvent.duration ?? "") } : e)))
    } else {
      setEvents([...events, { ...newEvent, parsedDate: parseDueDate(newEvent.duration ?? "") }])
    }
    setEditingEvent(null)
  }

  const handleSelectMonthYear = (date: Date) => {
    setCurrentDate(date)
  }

  const rawMonthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  const monthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1)

  const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1)

  // Dias que têm prazo de caso no mês/ano atual
  const deadlineDays = new Set(
    events
      .filter(
        (e) =>
          e.parsedDate &&
          e.parsedDate.month === currentDate.getMonth() &&
          e.parsedDate.year === currentDate.getFullYear(),
      )
      .map((e) => e.parsedDate!.day),
  )

  // Eventos do dia selecionado
  const eventsForSelectedDay = events.filter(
    (e) =>
      e.parsedDate &&
      e.parsedDate.day === selectedDay &&
      e.parsedDate.month === currentDate.getMonth() &&
      e.parsedDate.year === currentDate.getFullYear(),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handlePreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            className="font-semibold min-w-[160px] text-center capitalize hover:bg-secondary"
            onClick={() => setIsMonthPickerOpen(true)}
          >
            {monthName}
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="bg-transparent"
          onClick={() => setIsMonthPickerOpen(true)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Selecionar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDays.map((day) => {
              const isToday = day === today && currentDate.getMonth() === currentMonth
              const isSelected = day === selectedDay
              const hasDeadline = deadlineDays.has(day)

              return (
                <button
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium
                    transition-all duration-300 hover:scale-110 relative
                    ${
                      isToday
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : isSelected
                          ? "bg-primary/20 text-foreground border-2 border-primary/40"
                          : "hover:bg-secondary text-foreground"
                    }
                    ${day < today && currentDate.getMonth() === currentMonth ? "opacity-40" : ""}
                  `}
                >
                  {day}
                  {hasDeadline && !isToday && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-destructive" />
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            Prazos do dia {selectedDay}
          </h3>
          <div className="space-y-3">
            {eventsForSelectedDay.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum prazo neste dia.</p>
            ) : (
              eventsForSelectedDay.map((event, index) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300 animate-slide-in-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-1 self-stretch rounded-full ${event.color}`} />
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.type === "deadline" && (
                          <Badge variant="destructive" className="text-xs">
                            Prazo
                          </Badge>
                        )}
                        {event.type === "review" && (
                          <Badge variant="secondary" className="text-xs">
                            Concluído
                          </Badge>
                        )}
                        {event.type === "hearing" && <Briefcase className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => { setIsEventModalOpen(false); setEditingEvent(null) }}
        onSave={handleSaveEvent}
        event={editingEvent}
        isEditing={!!editingEvent}
      />

      <MonthYearPicker
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        onSelect={handleSelectMonthYear}
        currentDate={currentDate}
      />
    </div>
  )
}
