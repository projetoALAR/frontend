"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { AiDisclaimer } from "@/components/ai-disclaimer"
import { useToast } from "@/hooks/use-toast"

const ALLOW_PUBLIC_REGISTER =
  process.env.NEXT_PUBLIC_ALLOW_REGISTER === "true" ||
  process.env.NEXT_PUBLIC_ALLOW_REGISTER === "1"

export default function LoginPage() {
  const { login, register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)

  const isRegister = ALLOW_PUBLIC_REGISTER && mode === "register"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register(nome, email, senha)
      } else {
        await login(email, senha)
      }
      toast({
        title: isRegister ? "Conta criada" : "Bem-vindo!",
        description: "Sessão iniciada com sucesso",
      })
      router.replace("/")
    } catch (err) {
      toast({
        title: "Falha na autenticação",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Alar</h1>
          <p className="text-sm text-muted-foreground">
            {isRegister ? "Crie uma nova conta" : "Entre na sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={isRegister ? 8 : 6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : isRegister ? "Cadastrar" : "Entrar"}
          </Button>
        </form>

        <AiDisclaimer compact />

        {ALLOW_PUBLIC_REGISTER ? (
          <button
            type="button"
            className="w-full text-sm text-primary hover:underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Criar uma conta" : "Já tenho conta — entrar"}
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Contas são criadas por um administrador.
          </p>
        )}
      </Card>
    </div>
  )
}
