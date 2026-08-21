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
import { casoHref, rotas } from "@/lib/app-routes"
import { useAuth } from "@/components/auth/auth-provider"
import { preferenciasApi } from "@/lib/preferencias-api"
import { inboxApi } from "@/lib/inbox-api"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import type { ReactNode } from "react"
import { ROLE_LABELS } from "@/lib/roles"

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
    () =>
      [
        ...(data?.proximosPrazos?.processos ?? []).map((p) => ({
          id: `p-${p.id}`,
          tipo: "processo" as const,
          entityId: p.id,
          processoId: p.id as string | null,
          title: p.titulo || p.numero,
          dueDate: formatDatePt(p.prazo),
        })),
        ...(data?.proximosPrazos?.compromissos ?? []).map((c) => ({
          id: `c-${c.id}`,
          tipo: "compromisso" as const,
          entityId: c.processoId || c.id,
          processoId: c.processoId,
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

  const iniciais =
    (user?.nome || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"

  const roleLabel = user?.role ? ROLE_LABELS[user.role] : null

  return (
    <header className="animate-fade-in space-y-4 pb-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <MobileNav />
          <div className="min-w-0 pt-0.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 self-end sm:self-start">
          <div className="mr-1 hidden min-w-[12rem] max-w-xs flex-1 sm:block lg:min-w-[16rem]">
            <GlobalSearch />
          </div>
          <div className="sm:hidden flex-1 min-w-0">
            <GlobalSearch />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-10 min-w-10 text-muted-foreground hover:text-foreground"
            aria-label={
              inboxUnread > 0 ? `Mensagens, ${inboxUnread} não lidas` : "Mensagens"
            }
            onClick={() => router.push(rotas.mensagens)}
          >
            <Mail className="w-4 h-4" />
            {inboxUnread > 0 && (
              <>
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
                <span className="sr-only">{inboxUnread} mensagens não lidas</span>
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative min-h-10 min-w-10 text-muted-foreground hover:text-foreground"
                aria-label={
                  unreadCount > 0
                    ? `Notificações, ${unreadCount} não lidas`
                    : "Notificações"
                }
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full" />
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
                <div className="p-3 text-xs text-muted-foreground text-center">
                  Nenhuma notificação.
                </div>
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
                      } else if (item.processoId) {
                        router.push(casoHref(item.processoId))
                      } else {
                        router.push(rotas.agenda)
                      }
                    }}
                  >
                    <span className="text-sm font-medium leading-tight">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      Prazo: {item.dueDate}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-primary justify-center cursor-pointer"
                onClick={() => router.push(rotas.casos)}
              >
                Ver todos os casos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => {
              void refresh()
              router.push(rotas.configuracoes)
            }}
            aria-label={`Conta de ${user?.nome || "usuário"}`}
            className="ml-1 flex items-center gap-2.5 border-l border-border/70 pl-2.5 min-h-10 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Avatar className="w-8 h-8 ring-1 ring-border">
              <AvatarImage src={user?.fotoUrl || undefined} alt={user?.nome || "Conta"} />
              <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-medium">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left lg:block max-w-[9rem]">
              <p className="text-sm font-medium text-foreground truncate leading-tight">
                {user?.nome || "Conta"}
              </p>
              {roleLabel ? (
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              ) : null}
            </div>
          </button>
        </div>
      </div>

      {actions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div>
      ) : null}
    </header>
  )
}
