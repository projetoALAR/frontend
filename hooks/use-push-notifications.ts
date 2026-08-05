"use client"

import { useCallback, useEffect, useState } from "react"
import { preferenciasApi } from "@/lib/preferencias-api"
import { inboxApi, type InboxItemApi } from "@/lib/inbox-api"

const SEEN_KEY = "alar_push_seen"

export function usePushNotifications() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    void preferenciasApi
      .obter()
      .then((prefs) => {
        const n = prefs.notificacoes as { push?: boolean }
        setEnabled(n?.push !== false)
      })
      .catch(() => {})
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false
    if (Notification.permission === "granted") return true
    if (Notification.permission === "denied") return false
    const result = await Notification.requestPermission()
    return result === "granted"
  }, [])

  const notifyNewInbox = useCallback(
    async (items: InboxItemApi[]) => {
      if (!enabled || typeof window === "undefined" || !("Notification" in window)) return
      if (Notification.permission !== "granted") return

      let seen: string[] = []
      try {
        seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") as string[]
      } catch {
        seen = []
      }

      const novos = items.filter((i) => !i.lida && !seen.includes(i.id)).slice(0, 3)
      for (const item of novos) {
        new Notification(item.titulo, { body: item.corpo, tag: item.id })
        seen.push(item.id)
      }
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-100)))
    },
    [enabled],
  )

  const pollAndNotify = useCallback(async () => {
    if (!enabled) return
    try {
      const items = await inboxApi.listar(true)
      await notifyNewInbox(items)
    } catch {
      // ignore
    }
  }, [enabled, notifyNewInbox])

  useEffect(() => {
    if (!enabled) return
    void requestPermission().then((ok) => {
      if (ok) void pollAndNotify()
    })
    const id = window.setInterval(() => void pollAndNotify(), 60000)
    return () => window.clearInterval(id)
  }, [enabled, pollAndNotify, requestPermission])

  return { requestPermission, enabled }
}
