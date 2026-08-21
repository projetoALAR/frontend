"use client"

import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  MessageCircle,
  Contact,
  FileText,
  ScrollText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessMenuHref, ROLE_LABELS } from "@/lib/roles"
import { rotas } from "@/lib/app-routes"
import { AlarLogo } from "@/components/brand/alar-logo"

const generalItems = [
  { icon: Settings, label: "Configurações", href: rotas.configuracoes },
  { icon: HelpCircle, label: "Ajuda", href: rotas.ajuda },
]

type SidebarProps = {
  /** Dentro do Sheet no mobile — sem `fixed`/`hidden` */
  mobile?: boolean
}

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-10",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
        />
      ) : null}
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      />
      <span className="truncate">{label}</span>
      {badge ? (
        <span
          className={cn(
            "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums",
            active
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data } = useDashboardResumo()
  const menuItems = useMemo(() => {
    const total = data?.totalProcessos ?? 0
    const all = [
      { icon: LayoutDashboard, label: "Painel", href: rotas.painel },
      {
        icon: FolderKanban,
        label: "Casos",
        badge: total > 0 ? String(total) : undefined,
        href: rotas.casos,
      },
      { icon: Contact, label: "Clientes", href: rotas.clientes },
      { icon: FileText, label: "Modelos", href: rotas.modelos },
      { icon: Calendar, label: "Agenda", href: rotas.agenda },
      { icon: BarChart3, label: "Relatórios", href: rotas.relatorios },
      { icon: Users, label: "Equipe", href: rotas.equipe },
      { icon: ScrollText, label: "Auditoria", href: rotas.auditoria },
      { icon: MessageCircle, label: "Chat IA", href: rotas.chat },
    ]
    return all.filter((item) => canAccessMenuHref(item.href, user?.role))
  }, [data?.totalProcessos, user?.role])

  return (
    <aside
      className={cn(
        "bg-sidebar p-3.5 overflow-y-auto flex flex-col",
        mobile
          ? "relative h-full w-full border-0"
          : "fixed top-0 left-0 z-40 hidden h-screen w-64 border-r border-sidebar-border md:block",
      )}
    >
      <div className="mb-5 px-1.5 pt-1">
        <AlarLogo href="/" size="md" />
      </div>

      <div className="space-y-5 flex-1">
        <div>
          <p className="px-2.5 text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-[0.08em]">
            Menu
          </p>
          <nav className="space-y-0.5" aria-label="Menu principal">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === rotas.casos && pathname.startsWith("/casos/")) ||
                (item.href === rotas.clientes && pathname.startsWith("/clientes/"))
              return (
                <NavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  active={isActive}
                />
              )
            })}
          </nav>
        </div>

        <div>
          <p className="px-2.5 text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-[0.08em]">
            Geral
          </p>
          <nav className="space-y-0.5" aria-label="Configurações e ajuda">
            {generalItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <NavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive}
                />
              )
            })}
          </nav>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-sidebar-border space-y-1">
        {user ? (
          <Link
            href={rotas.configuracoes}
            className="block rounded-lg px-2.5 py-2 hover:bg-secondary/80 transition-colors"
          >
            <p className="text-sm font-medium text-foreground truncate">{user.nome}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role ? ROLE_LABELS[user.role] : ""}
            </p>
          </Link>
        ) : null}
        <Link
          href={rotas.logout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium min-h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Link>
      </div>
    </aside>
  )
}
