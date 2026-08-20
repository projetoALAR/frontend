"use client"

import { FormEvent, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlarLogo } from "@/components/brand/alar-logo"
import { PasswordHints } from "@/components/password-hints"
import { senhaAtendePolitica } from "@/lib/password-policy"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/auth-api"

function RedefinirSenhaForm() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useSearchParams()
  const token = useMemo(() => params.get("token")?.trim() || "", [params])
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast({
        title: "Link inválido",
        description: "Abra o link completo enviado por e-mail.",
        variant: "destructive",
      })
      return
    }
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
      await authApi.resetPassword(token, novaSenha)
      toast({ title: "Senha redefinida", description: "Faça login com a nova senha." })
      router.replace("/login")
    } catch (error) {
      toast({
        title: "Não foi possível redefinir",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-6 space-y-4">
      <div className="flex justify-center">
        <AlarLogo />
      </div>
      <h1 className="text-xl font-semibold text-center">Nova senha</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
          <Label htmlFor="conf">Confirmar senha</Label>
          <Input
            id="conf"
            type="password"
            required
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !token}>
          {loading ? "Salvando..." : "Salvar senha"}
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link href="/login" className="underline text-muted-foreground">
          Voltar ao login
        </Link>
      </p>
    </Card>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
        <RedefinirSenhaForm />
      </Suspense>
    </div>
  )
}
