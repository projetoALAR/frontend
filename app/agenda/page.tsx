"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/dashboard/header"
import { CalendarContent } from "@/components/calendar/calendar-content"

export default function AgendaPage() {
  return (
    <AppShell>
      <Header
        title="Agenda"
        description="Agende e acompanhe eventos, reuniões e prazos da equipe."
      />
      <div className="mt-6">
        <CalendarContent />
      </div>
    </AppShell>
  )
}
