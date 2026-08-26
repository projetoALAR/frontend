"use client"

import { useCallback, useEffect, useState } from "react"
import { dashboardApi, type DashboardResumo } from "@/lib/dashboard-api"

let cache: DashboardResumo | null = null
let cacheAt = 0
let inflight: Promise<DashboardResumo> | null = null
const listeners = new Set<() => void>()
const TTL_MS = 45_000

function cacheFresh() {
  return cache != null && Date.now() - cacheAt < TTL_MS
}

async function fetchResumo(force = false) {
  if (!force && cacheFresh() && cache) return cache
  if (!force && inflight) return inflight
  inflight = dashboardApi
    .resumo()
    .then((data) => {
      cache = data
      cacheAt = Date.now()
      return data
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function useDashboardResumo() {
  const [data, setData] = useState<DashboardResumo | null>(cache)
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async (force = false) => {
    const showSpinner = force || !cache
    if (showSpinner) setLoading(true)
    setError(null)
    try {
      const resumo = await fetchResumo(force)
      setData(resumo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dashboard")
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const onInvalidate = () => {
      void reload(true)
    }
    listeners.add(onInvalidate)
    void reload(false)
    return () => {
      listeners.delete(onInvalidate)
    }
  }, [reload])

  return { data, loading, error, reload: () => reload(true) }
}

/** Limpa o cache e avisa todos os consumidores para recarregar. */
export function invalidateDashboardCache() {
  cache = null
  cacheAt = 0
  inflight = null
  listeners.forEach((listener) => listener())
}
