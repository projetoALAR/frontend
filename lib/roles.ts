export type Role = "ADMIN" | "ADVOGADO" | "ASSISTENTE"

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  ADVOGADO: "Advogado",
  ASSISTENTE: "Assistente",
}

/** Rotas do menu principal acessíveis por cada papel. */
const MENU_HREFS_BY_ROLE: Record<Role, readonly string[]> = {
  ADMIN: ["/", "/casos", "/clientes", "/agenda", "/relatorios", "/equipe", "/chat", "/modelos", "/auditoria"],
  ADVOGADO: ["/", "/casos", "/clientes", "/agenda", "/chat", "/modelos"],
  ASSISTENTE: ["/", "/casos", "/clientes", "/agenda", "/chat", "/modelos"],
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

export function canViewAuditoria(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canWriteClientesProcessos(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO"
}

export function canWriteAndamentos(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO" || role === "ASSISTENTE"
}

export function canDeleteAndamentos(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO"
}

export function canExportarCliente(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO"
}

export function canAnonimizarCliente(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canDeleteDocumentos(role?: Role | null): boolean {
  return role === "ADMIN" || role === "ADVOGADO"
}

export function canCreateUsers(role?: Role | null): boolean {
  return role === "ADMIN"
}

export function canAccessMenuHref(href: string, role?: Role | null): boolean {
  if (!role) return false
  return MENU_HREFS_BY_ROLE[role]?.includes(href) ?? false
}

/** Bloqueia acesso direto por URL a rotas restritas do menu. */
export function canAccessPath(pathname: string, role?: Role | null): boolean {
  if (!role) return false

  if (
    pathname === "/relatorios" ||
    pathname.startsWith("/relatorios/") ||
    pathname === "/analytics" ||
    pathname.startsWith("/analytics/")
  ) {
    return canViewAnalytics(role)
  }
  if (pathname === "/auditoria" || pathname.startsWith("/auditoria/")) {
    return canViewAuditoria(role)
  }
  if (
    pathname === "/equipe" ||
    pathname.startsWith("/equipe/") ||
    pathname === "/team" ||
    pathname.startsWith("/team/")
  ) {
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
