"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { authApi, type AuthUser, type Role } from "@/lib/auth-api"
import { ROLE_LABELS } from "@/lib/roles"
import { useToast } from "@/hooks/use-toast"
import { PasswordHints } from "@/components/password-hints"
import { senhaAtendePolitica } from "@/lib/password-policy"
import { invalidateDashboardCache } from "@/hooks/use-dashboard-resumo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AdminUsersPanel() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [role, setRole] = useState<Role>("ASSISTENTE")
  const [tempUserId, setTempUserId] = useState<string | null>(null)
  const [tempSenha, setTempSenha] = useState("")
  const [devResetLink, setDevResetLink] = useState<string | null>(null)

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

  const pendentes = useMemo(
    () => users.filter((u) => u.mustChangePassword).length,
    [users],
  )

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authApi.createUser({ nome, email, senha, role })
      setNome("")
      setEmail("")
      setSenha("")
      setRole("ASSISTENTE")
      invalidateDashboardCache()
      toast({ title: "Usuário criado", description: "Também aparece na equipe" })
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

  const handleEnviarReset = async (user: AuthUser) => {
    setActionId(user.id)
    setDevResetLink(null)
    try {
      const res = await authApi.adminEnviarLinkReset(user.id)
      await load()
      if (res.devResetLink) {
        setDevResetLink(res.devResetLink)
        toast({
          title: "Link gerado (dev)",
          description: "SMTP off — use o link exibido abaixo.",
        })
      } else {
        toast({
          title: "Link enviado",
          description: `E-mail de redefinição para ${user.email}.`,
        })
      }
    } catch (error) {
      toast({
        title: "Não foi possível enviar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  const handleSalvarSenhaTemp = async (e: FormEvent) => {
    e.preventDefault()
    if (!tempUserId) return
    if (!senhaAtendePolitica(tempSenha)) {
      toast({
        title: "Senha fraca",
        description: "Use no mínimo 10 caracteres, com maiúscula, minúscula e número.",
        variant: "destructive",
      })
      return
    }
    setActionId(tempUserId)
    try {
      await authApi.adminDefinirSenhaTemporaria(tempUserId, tempSenha)
      setTempUserId(null)
      setTempSenha("")
      await load()
      toast({
        title: "Senha temporária definida",
        description: "Troca obrigatória marcada; convite enviado quando houver SMTP.",
      })
    } catch (error) {
      toast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setActionId(null)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg">Usuários do sistema</h3>
        <p className="text-sm text-muted-foreground">
          Apenas administradores podem criar contas quando o cadastro público está
          desabilitado. Novos usuários entram automaticamente na equipe.
          {pendentes > 0
            ? ` ${pendentes} ainda precisam trocar a senha.`
            : null}
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
            minLength={10}
          />
          <PasswordHints senha={senha} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-user-role">Papel</Label>
          <Select value={role} onValueChange={(value) => setRole(value as Role)}>
            <SelectTrigger id="admin-user-role" className="w-full">
              <SelectValue placeholder="Selecione o papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASSISTENTE">Assistente</SelectItem>
              <SelectItem value="ADVOGADO">Advogado</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </form>

      {devResetLink ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm space-y-1">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Link de redefinição (desenvolvimento)
          </p>
          <a href={devResetLink} className="text-xs text-primary underline break-all">
            {devResetLink}
          </a>
        </div>
      ) : null}

      {tempUserId ? (
        <form
          onSubmit={(e) => void handleSalvarSenhaTemp(e)}
          className="rounded-lg border border-border p-3 space-y-3"
        >
          <p className="text-sm font-medium">
            Nova senha temporária —{" "}
            {users.find((u) => u.id === tempUserId)?.email ?? "usuário"}
          </p>
          <div className="space-y-2">
            <Label htmlFor="admin-temp-senha">Senha</Label>
            <Input
              id="admin-temp-senha"
              type="password"
              value={tempSenha}
              onChange={(e) => setTempSenha(e.target.value)}
              required
              minLength={10}
              autoComplete="new-password"
            />
            <PasswordHints senha={tempSenha} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={actionId === tempUserId}>
              {actionId === tempUserId ? "Salvando..." : "Salvar e enviar convite"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setTempUserId(null)
                setTempSenha("")
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

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
              className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{u.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {u.mustChangePassword ? (
                  <Badge variant="destructive">Troca pendente</Badge>
                ) : null}
                <Badge variant="secondary">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={actionId === u.id}
                  onClick={() => void handleEnviarReset(u)}
                >
                  {actionId === u.id ? "..." : "Enviar link"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={actionId === u.id}
                  onClick={() => {
                    setTempUserId(u.id)
                    setTempSenha("")
                    setDevResetLink(null)
                  }}
                >
                  Senha temp.
                </Button>
              </div>
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
