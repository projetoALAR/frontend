export type Role = "ADMIN" | "ADVOGADO" | "ASSISTENTE"

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  ADVOGADO: "Advogado",
  ASSISTENTE: "Assistente",
}

/** Rotas do menu principal acessíveis por cada papel. */
const MENU_HREFS_BY_ROLE: Record<Role, readonly string[]> = {
  ADMIN: ["/", "/tasks", "/clients", "/calendar", "/analytics", "/team", "/chat"],
  ADVOGADO: ["/", "/tasks", "/clients", "/calendar", "/chat"],
  ASSISTENTE: ["/", "/tasks", "/clients", "/calendar", "/chat"],
}

export function canManageEquipe(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canViewEquipe(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canViewAnalytics(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canWriteClientesProcessos(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO"
}

export function canDeleteDocumentos(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO"
}

export function canCreateUsers(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canAccessMenuHref(href: string, role?: Role | null): boolean {
  if (!role) return false
  return MENU_HREFS_BY_ROLE[role].includes(href)
}

/** Bloqueia acesso direto por URL a rotas restritas do menu. */
export function canAccessPath(pathname: string, role?: Role | null): boolean {
  if (!role) return false

  if (pathname === "/analytics" || pathname.startsWith("/analytics/")) {
    return canViewAnalytics(role)
  }
  if (pathname === "/team" || pathname.startsWith("/team/")) {
    return canViewEquipe(role)
  }

  return true
}

export function getHomeCopy(role?: Role | null): { title: string; description: string } {
  switch (role) {
    case "ADVOGADO":
      return {
        title: "Meu painel",
        description: "Acompanhe seus casos, prazos e clientes.",
      }
    case "ASSISTENTE":
      return {
        title: "Painel operacional",
        description: "Agenda, documentos e acompanhamento dos casos do escritório.",
      }
    case "ADMIN":
    default:
      return {
        title: "Advocacia Alar",
        description: "Acompanhe seus casos, clientes e documentações em um só lugar.",
      }
  }
}
