"use client"

import { useCallback, useEffect, useState } from "react"
import { dashboardApi, type DashboardResumo } from "@/lib/dashboard-api"

let cache: DashboardResumo | null = null
let inflight: Promise<DashboardResumo> | null = null

async function fetchResumo(force = false) {
  if (!force && cache) return cache
  if (!force && inflight) return inflight
  inflight = dashboardApi
    .resumo()
    .then((data) => {
      cache = data
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
    setLoading(true)
    setError(null)
    try {
      const resumo = await fetchResumo(force)
      setData(resumo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload(false)
  }, [reload])

  return { data, loading, error, reload: () => reload(true) }
}

export function invalidateDashboardCache() {
  cache = null
  inflight = null
}
