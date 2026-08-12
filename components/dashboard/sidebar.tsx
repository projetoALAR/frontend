"use client"

import { LayoutDashboard, FolderKanban, Calendar, BarChart3, Users, Settings, HelpCircle, LogOut, MessageCircle, Contact, FileText, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDashboardResumo } from "@/hooks/use-dashboard-resumo"
import { useAuth } from "@/components/auth/auth-provider"
import { canAccessMenuHref } from "@/lib/roles"

const generalItems = [
  { icon: Settings, label: "Configurações", href: "/settings" },
  { icon: HelpCircle, label: "Ajuda", href: "/help" },
  { icon: LogOut, label: "Sair", href: "/logout" },
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
      { icon: LayoutDashboard, label: "Painel", href: "/" },
      { icon: FolderKanban, label: "Casos", badge: String(data?.totalProcessos ?? 0), href: "/tasks" },
      { icon: Contact, label: "Clientes", href: "/clients" },
      { icon: FileText, label: "Modelos", href: "/templates" },
      { icon: Calendar, label: "Calendário", href: "/calendar" },
      { icon: BarChart3, label: "Relatórios", href: "/analytics" },
      { icon: Users, label: "Equipe", href: "/team" },
      { icon: ScrollText, label: "Auditoria", href: "/auditoria" },
      { icon: MessageCircle, label: "Chat IA", href: "/chat" },
    ]
    return all.filter((item) => canAccessMenuHref(item.href, user?.role))
  }, [data?.totalProcessos, user?.role])

  return (
    <aside
      className={cn(
        "bg-card p-4 overflow-y-auto",
        mobile
          ? "relative h-full w-full border-0"
          : "fixed top-0 left-0 z-40 hidden h-screen w-64 border-r border-border lg:block",
      )}
    >
      <div className="flex items-center gap-2 mb-6 group cursor-pointer">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
            <span className="text-primary-foreground font-bold text-sm tracking-tight">A</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">Alar</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Menu</p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
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
          <nav className="space-y-0.5">
            {generalItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
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
