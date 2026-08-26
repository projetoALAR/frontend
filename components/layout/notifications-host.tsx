"use client"

import { usePushNotifications } from "@/hooks/use-push-notifications"

/** Roda push/inbox polling uma vez no shell autenticado (não por página). */
export function NotificationsHost() {
  usePushNotifications()
  return null
}
