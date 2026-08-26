import { preferenciasApi } from "@/lib/preferencias-api"
import { inboxApi } from "@/lib/inbox-api"

const TTL_MS = 45_000

let lidasCache: { value: string[]; at: number } | null = null
let inboxCache: { value: number; at: number } | null = null
let lidasInflight: Promise<string[]> | null = null
let inboxInflight: Promise<number> | null = null

function fresh(at: number) {
  return Date.now() - at < TTL_MS
}

export async function getNotificacoesLidas(force = false): Promise<string[]> {
  if (!force && lidasCache && fresh(lidasCache.at)) return lidasCache.value
  if (!force && lidasInflight) return lidasInflight
  lidasInflight = preferenciasApi
    .obter()
    .then((prefs) => {
      const list = Array.isArray(prefs.notificacoesLidas) ? prefs.notificacoesLidas : []
      lidasCache = { value: list, at: Date.now() }
      return list
    })
    .catch(() => lidasCache?.value ?? [])
    .finally(() => {
      lidasInflight = null
    })
  return lidasInflight
}

export async function getInboxUnreadCount(force = false): Promise<number> {
  if (!force && inboxCache && fresh(inboxCache.at)) return inboxCache.value
  if (!force && inboxInflight) return inboxInflight
  inboxInflight = inboxApi
    .listar(true)
    .then((items) => {
      const n = items.length
      inboxCache = { value: n, at: Date.now() }
      return n
    })
    .catch(() => inboxCache?.value ?? 0)
    .finally(() => {
      inboxInflight = null
    })
  return inboxInflight
}

export function setNotificacoesLidasCache(ids: string[]) {
  lidasCache = { value: ids, at: Date.now() }
}

export function invalidateHeaderNotificacoesCache() {
  lidasCache = null
  inboxCache = null
  lidasInflight = null
  inboxInflight = null
}
