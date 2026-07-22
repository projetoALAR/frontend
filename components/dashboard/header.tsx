"use client"

import { Mail, Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./mobile-nav"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { formatDatePt } from "@/lib/format"
import type { ReactNode } from "react"

interface HeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const router = useRouter()
  const [notifRead, setNotifRead] = useState(false)
  const { data } = useDashboardResumo()

  const deadlines = [
    ...(data?.proximosPrazos?.processos ?? []).map((p) => ({
      id: `p-${p.id}`,
      title: p.titulo || p.numero,
      dueDate: formatDatePt(p.prazo),
    })),
    ...(data?.proximosPrazos?.compromissos ?? []).map((c) => ({
      id: `c-${c.id}`,
      title: c.titulo,
      dueDate: formatDatePt(c.dataHora),
    })),
  ].slice(0, 3)

  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <MobileNav />
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
            title="Mensagens"
            onClick={() => router.push("/chat")}
          >
            <Mail className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 h-8 w-8"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {!notifRead && deadlines.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                <button
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  onClick={() => setNotifRead(true)}
                >
                  <CheckCheck className="w-3 h-3" />
                  Marcar como lidas
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {deadlines.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">Nenhuma notificação.</div>
              ) : (
                deadlines.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className="flex flex-col items-start gap-0.5 cursor-pointer py-2.5"
                    onClick={() => router.push("/tasks")}
                  >
                    <span className="text-sm font-medium leading-tight">{item.title}</span>
                    <span className="text-xs text-muted-foreground">Prazo: {item.dueDate}</span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-primary justify-center cursor-pointer"
                onClick={() => router.push("/tasks")}
              >
                Ver todos os casos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
              <AvatarImage src="/avatar-alar.png" alt="Alar" />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">AL</AvatarFallback>
            </Avatar>
            <div className="text-xs hidden sm:block">
              <p className="font-semibold text-foreground">Minha Conta</p>
              <p className="text-muted-foreground text-[10px]">admin@alar.com.br</p>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">{title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
      </div>

      {actions && <div className="flex flex-col sm:flex-row gap-2">{actions}</div>}
    </header>
  )
}
