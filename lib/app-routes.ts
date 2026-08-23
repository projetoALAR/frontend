export const rotas = {
  painel: "/",
  casos: "/casos",
  clientes: "/clientes",
  agenda: "/agenda",
  relatorios: "/relatorios",
  modelos: "/modelos",
  equipe: "/equipe",
  auditoria: "/auditoria",
  chat: "/chat",
  configuracoes: "/configuracoes",
  ajuda: "/ajuda",
  mensagens: "/mensagens",
  login: "/login",
  logout: "/logout",
  planos: "/planos",
} as const

export function casoHref(id: string) {
  return `${rotas.casos}/${id}`
}

export function clienteHref(id: string) {
  return `${rotas.clientes}/${id}`
}

export function casosListaHref(opts?: { filter?: string; novo?: boolean }) {
  const params = new URLSearchParams()
  if (opts?.filter && opts.filter !== "all") params.set("filter", opts.filter)
  if (opts?.novo) params.set("novo", "1")
  const qs = params.toString()
  return qs ? `${rotas.casos}?${qs}` : rotas.casos
}

export function clientesListaHref(opts?: { q?: string; novo?: boolean }) {
  const params = new URLSearchParams()
  if (opts?.q) params.set("q", opts.q)
  if (opts?.novo) params.set("novo", "1")
  const qs = params.toString()
  return qs ? `${rotas.clientes}?${qs}` : rotas.clientes
}
