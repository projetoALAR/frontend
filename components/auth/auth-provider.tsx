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
} from "@/lib/auth-api"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, senha: string) => {
    clearLegacyAuthToken()
    const result = await authApi.login(email, senha)
    setUser(result.user)
  }, [])

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    clearLegacyAuthToken()
    const result = await authApi.register(nome, email, senha)
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh],
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
