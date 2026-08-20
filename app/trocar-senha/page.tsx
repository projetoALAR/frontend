"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlarLogo } from "@/components/brand/alar-logo"
import { PasswordHints } from "@/components/password-hints"
import { senhaAtendePolitica } from "@/lib/password-policy"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { authApi } from "@/lib/auth-api"

export default function TrocarSenhaPage() {
  const { user, refresh } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!senhaAtendePolitica(novaSenha)) {
      toast({
        title: "Senha fraca",
        description: "Use no mínimo 10 caracteres, com maiúscula, minúscula e número.",
        variant: "destructive",
      })
      return
    }
    if (novaSenha !== confirmar) {
      toast({
        title: "Senhas diferentes",
        description: "Digite a mesma senha nos dois campos.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      await authApi.changePassword(senhaAtual || undefined, novaSenha)
      await refresh()
      toast({ title: "Senha atualizada", description: "Pode usar o Alar normalmente." })
      router.replace("/")
    } catch (error) {
      toast({
        title: "Não foi possível trocar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex justify-center">
          <AlarLogo />
        </div>
        <h1 className="text-xl font-semibold text-center">Troca de senha obrigatória</h1>
        <p className="text-sm text-muted-foreground text-center">
          {user?.email
            ? `Olá! Sua conta (${user.email}) usa senha temporária. Defina uma senha nova para continuar.`
            : "Defina uma senha nova para continuar."}
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="atual">Senha temporária (opcional)</Label>
            <Input
              id="atual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova">Nova senha</Label>
            <Input
              id="nova"
              type="password"
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoComplete="new-password"
            />
            <PasswordHints senha={novaSenha} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conf">Confirmar nova senha</Label>
            <Input
              id="conf"
              type="password"
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar e continuar"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
