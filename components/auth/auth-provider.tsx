"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  authApi,
  clearLegacyAuthToken,
  type AuthUser,
  type LoginResult,
} from "@/lib/auth-api"
import { billingApi } from "@/lib/billing-api"
import {
  billingEnforceAtivo,
  limparAssinaturaLocal,
  sincronizarAssinaturaLocal,
} from "@/lib/planos"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, senha: string) => Promise<LoginResult>
  completeTwoFactor: (preAuthToken: string, code: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const syncBilling = useCallback(async (userId: string) => {
    if (!billingEnforceAtivo()) return
    try {
      const data = await billingApi.minha()
      sincronizarAssinaturaLocal(userId, data)
    } catch {
      // ignore — gate usa cache local se houver
    }
  }, [])

  const refresh = useCallback(async () => {
    clearLegacyAuthToken()
    try {
      const sessionRes = await fetch("/api/auth/session", {
        credentials: "same-origin",
      })
      const session = (await sessionRes.json()) as { authenticated?: boolean }
      if (!session.authenticated) {
        setUser(null)
        return
      }

      const me = await authApi.me()
      await syncBilling(me.id)
      setUser(me)
    } catch (error) {
      setUser(null)
      const isUnauthorized =
        error instanceof Error && error.message === "Não autenticado"
      if (isUnauthorized) {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
          })
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false)
    }
  }, [syncBilling])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, senha: string) => {
    clearLegacyAuthToken()
    const result = await authApi.login(email, senha)
    if ("requires2fa" in result) {
      return result
    }
    await syncBilling(result.user.id)
    setUser(result.user)
    return result
  }, [syncBilling])

  const completeTwoFactor = useCallback(
    async (preAuthToken: string, code: string) => {
      clearLegacyAuthToken()
      const result = await authApi.verifyTwoFactor(preAuthToken, code)
      await syncBilling(result.user.id)
      setUser(result.user)
    },
    [syncBilling],
  )

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    clearLegacyAuthToken()
    const result = await authApi.register(nome, email, senha)
    await syncBilling(result.user.id)
    setUser(result.user)
  }, [syncBilling])

  const logout = useCallback(async () => {
    const uid = user?.id
    try {
      await authApi.logout()
    } finally {
      if (uid) limparAssinaturaLocal(uid)
      setUser(null)
    }
  }, [user?.id])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      completeTwoFactor,
      register,
      logout,
      refresh,
      setUser,
    }),
    [user, loading, login, completeTwoFactor, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return ctx
}
