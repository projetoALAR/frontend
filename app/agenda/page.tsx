"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { CalendarContent } from "@/components/calendar/calendar-content"

export default function AgendaPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 overflow-x-hidden">
        <header className="space-y-3 md:space-y-4 mb-6">
          <div className="flex items-start gap-2">
            <MobileNav />
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">Agenda</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Agende e acompanhe eventos, reuniões e prazos da equipe.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6">
          <CalendarContent />
        </div>
      </main>
    </div>
  )
}
