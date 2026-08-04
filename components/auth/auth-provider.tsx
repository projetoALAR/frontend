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
  clearAuthToken,
  getAuthToken,
  setAuthToken,
  type AuthUser,
} from "@/lib/auth-api"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      clearAuthToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, senha: string) => {
    const result = await authApi.login(email, senha)
    setAuthToken(result.access_token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (nome: string, email: string, senha: string) => {
    const result = await authApi.register(nome, email, senha)
    setAuthToken(result.access_token)
    setUser(result.user)
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
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
