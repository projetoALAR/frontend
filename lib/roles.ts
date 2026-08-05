export type Role = "ADMIN" | "ADVOGADO" | "ASSISTENTE"

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  ADVOGADO: "Advogado",
  ASSISTENTE: "Assistente",
}

export function canManageEquipe(role?: Role | null): boolean {
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
