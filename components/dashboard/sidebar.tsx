"use client"

import { LayoutDashboard, FolderKanban, Calendar, BarChart3, Users, Settings, HelpCircle, LogOut, MessageCircle, Contact, FileText, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessMenuHref } from "@/lib/roles"
import { rotas } from "@/lib/app-routes"
import { AlarLogo } from "@/components/brand/alar-logo"

const generalItems = [
  { icon: Settings, label: "Configurações", href: rotas.configuracoes },
  { icon: HelpCircle, label: "Ajuda", href: rotas.ajuda },
  { icon: LogOut, label: "Sair", href: rotas.logout },
]

type SidebarProps = {
  /** Dentro do Sheet no mobile — sem `fixed`/`hidden` */
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()
  const { user } = useAuth()
  const { data } = useDashboardResumo()
  const menuItems = useMemo(() => {
    const all = [
      { icon: LayoutDashboard, label: "Painel", href: rotas.painel },
      { icon: FolderKanban, label: "Casos", badge: String(data?.totalProcessos ?? 0), href: rotas.casos },
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
        "bg-card p-4 overflow-y-auto",
        mobile
          ? "relative h-full w-full border-0"
          : "fixed top-0 left-0 z-40 hidden h-screen w-64 border-r border-border md:block",
      )}
    >
      <div className="mb-6">
        <AlarLogo href="/" size="md" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Menu</p>
          <nav className="space-y-0.5" aria-label="Menu principal">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === rotas.casos && pathname.startsWith("/casos/")) ||
                (item.href === rotas.clientes && pathname.startsWith("/clientes/"))
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-3 rounded-lg text-sm font-medium transition-all duration-300 min-h-11",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === item.label && !isActive && "translate-x-1",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Geral</p>
          <nav className="space-y-0.5" aria-label="Configurações e ajuda">
            {generalItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-3 rounded-lg text-sm font-medium transition-all duration-300 min-h-11",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === item.label && !isActive && "translate-x-1",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
