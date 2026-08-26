type CacheEntry<T> = { data: T; at: number }

const stores = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

const DEFAULT_TTL_MS = 30_000

export function peekListaCache<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
  const hit = stores.get(key) as CacheEntry<T> | undefined
  if (!hit) return null
  if (Date.now() - hit.at > ttlMs) return null
  return hit.data
}

export async function fetchWithListaCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { force?: boolean; ttlMs?: number },
): Promise<T> {
  const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS
  if (!opts?.force) {
    const hit = peekListaCache<T>(key, ttl)
    if (hit) return hit
    const pending = inflight.get(key) as Promise<T> | undefined
    if (pending) return pending
  }

  const p = fetcher()
    .then((data) => {
      stores.set(key, { data, at: Date.now() })
      return data
    })
    .finally(() => {
      inflight.delete(key)
    })
  inflight.set(key, p)
  return p
}

export function invalidateListaCache(prefix?: string) {
  if (!prefix) {
    stores.clear()
    inflight.clear()
    return
  }
  for (const key of stores.keys()) {
    if (key.startsWith(prefix)) stores.delete(key)
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key)
  }
}
