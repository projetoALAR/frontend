"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { authApi, type AuthUser, type Role } from "@/lib/auth-api"
import { ROLE_LABELS } from "@/lib/roles"
import { useToast } from "@/hooks/use-toast"

export function AdminUsersPanel() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [role, setRole] = useState<Role>("ASSISTENTE")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await authApi.listUsers())
    } catch (error) {
      toast({
        title: "Erro ao listar usuários",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authApi.createUser({ nome, email, senha, role })
      setNome("")
      setEmail("")
      setSenha("")
      setRole("ASSISTENTE")
      toast({ title: "Usuário criado" })
      await load()
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg">Usuários do sistema</h3>
        <p className="text-sm text-muted-foreground">
          Apenas administradores podem criar contas quando o cadastro público está desabilitado.
        </p>
      </div>

      <form onSubmit={(e) => void handleCreate(e)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="admin-user-nome">Nome</Label>
          <Input id="admin-user-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-user-email">E-mail</Label>
          <Input
            id="admin-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-user-senha">Senha temporária</Label>
          <Input
            id="admin-user-senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-user-role">Papel</Label>
          <select
            id="admin-user-role"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="ASSISTENTE">Assistente</option>
            <option value="ADVOGADO">Advogado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando usuários...
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{u.nome}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge variant="secondary">{ROLE_LABELS[u.role] ?? u.role}</Badge>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          )}
        </div>
      )}
    </Card>
  )
}
