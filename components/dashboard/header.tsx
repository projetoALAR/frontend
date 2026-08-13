"use client"

import { Mail, Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./mobile-nav"
import { GlobalSearch } from "@/components/search/global-search"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
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
import { casoHref } from "@/lib/caso-href"
import { useAuth } from "@/components/auth/auth-provider"
import { preferenciasApi } from "@/lib/preferencias-api"
import { inboxApi } from "@/lib/inbox-api"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import type { ReactNode } from "react"

interface HeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const router = useRouter()
  const { user, refresh } = useAuth()
  const { data } = useDashboardResumo()
  const [lidas, setLidas] = useState<string[]>([])
  const [inboxUnread, setInboxUnread] = useState(0)
  usePushNotifications()

  useEffect(() => {
    void preferenciasApi
      .obter()
      .then((prefs) => {
        const list = Array.isArray(prefs.notificacoesLidas) ? prefs.notificacoesLidas : []
        setLidas(list)
      })
      .catch(() => {})

    void inboxApi
      .listar(true)
      .then((items) => setInboxUnread(items.length))
      .catch(() => {})
  }, [])

  const deadlines = useMemo(
    () => [
      ...(data?.proximosPrazos?.processos ?? []).map((p) => ({
        id: `p-${p.id}`,
        tipo: "processo" as const,
        entityId: p.id,
        title: p.titulo || p.numero,
        dueDate: formatDatePt(p.prazo),
      })),
      ...(data?.proximosPrazos?.compromissos ?? []).map((c) => ({
        id: `c-${c.id}`,
        tipo: "compromisso" as const,
        entityId: c.id,
        title: c.titulo,
        dueDate: formatDatePt(c.dataHora),
      })),
    ].slice(0, 3),
    [data],
  )

  const unreadCount = deadlines.filter((d) => !lidas.includes(d.id)).length

  const marcarComoLidas = useCallback(async () => {
    const ids = Array.from(new Set([...lidas, ...deadlines.map((d) => d.id)]))
    setLidas(ids)
    try {
      await preferenciasApi.atualizar({ notificacoesLidas: ids })
    } catch {
      // estado local já atualizado
    }
  }, [deadlines, lidas])

  const iniciais = (user?.nome || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U"

  return (
    <header className="space-y-3 md:space-y-4 animate-slide-in-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MobileNav />
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 min-h-11 min-w-11"
            aria-label={inboxUnread > 0 ? `Mensagens, ${inboxUnread} não lidas` : "Mensagens"}
            onClick={() => router.push("/messages")}
          >
            <Mail className="w-4 h-4" />
            {inboxUnread > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                <span className="sr-only">{inboxUnread} mensagens não lidas</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary transition-all duration-300 hover:scale-110 min-h-11 min-w-11"
                aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : "Notificações"}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                    <span className="sr-only">{unreadCount} notificações não lidas</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                <button
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => {
                    e.preventDefault()
                    void marcarComoLidas()
                  }}
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
                    className={`flex flex-col items-start gap-0.5 cursor-pointer py-2.5 ${
                      !lidas.includes(item.id) ? "bg-secondary/40" : ""
                    }`}
                    onClick={() => {
                      if (item.tipo === "processo") {
                        router.push(casoHref(item.entityId))
                      } else {
                        router.push("/calendar")
                      }
                    }}
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
            type="button"
            onClick={() => {
              void refresh()
              router.push("/settings")
            }}
            aria-label={`Conta de ${user?.nome || "usuário"}`}
            className="flex items-center gap-2 pl-2 md:pl-3 border-l border-border hover:opacity-80 transition-opacity cursor-pointer min-h-11"
          >
            <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
              <AvatarImage src={user?.fotoUrl || undefined} alt={user?.nome || "Conta"} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs hidden md:block text-left max-w-[10rem] lg:max-w-[14rem]">
              <p className="font-semibold text-foreground truncate">{user?.nome || "Minha Conta"}</p>
              <p className="text-muted-foreground text-[10px] truncate">
                {user?.role
                  ? `${user.role === "ADMIN" ? "Administrador" : user.role === "ADVOGADO" ? "Advogado" : "Assistente"} · ${user.email}`
                  : user?.email || ""}
              </p>
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
