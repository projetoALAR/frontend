"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { AiDisclaimer } from "@/components/ai-disclaimer"
import { PasswordHints } from "@/components/password-hints"
import { senhaAtendePolitica } from "@/lib/password-policy"
import { useToast } from "@/hooks/use-toast"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AlarLogo } from "@/components/brand/alar-logo"

const ALLOW_PUBLIC_REGISTER =
  process.env.NEXT_PUBLIC_ALLOW_REGISTER === "true" ||
  process.env.NEXT_PUBLIC_ALLOW_REGISTER === "1"

export default function LoginPage() {
  const { login, register, completeTwoFactor } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [preAuthToken, setPreAuthToken] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [useRecovery, setUseRecovery] = useState(false)
  const [recovery, setRecovery] = useState("")

  const isRegister = ALLOW_PUBLIC_REGISTER && mode === "register"

  const finishLogin = () => {
    toast({
      title: isRegister ? "Conta criada" : "Bem-vindo!",
      description: "Sessão iniciada com sucesso",
    })
    router.replace("/")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (preAuthToken) {
        const code = useRecovery ? recovery.trim() : otp
        await completeTwoFactor(preAuthToken, code)
        finishLogin()
        return
      }

      if (isRegister) {
        if (!senhaAtendePolitica(senha)) {
          toast({
            title: "Senha fraca",
            description: "Use no mínimo 10 caracteres, com maiúscula, minúscula e número.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
        await register(nome, email, senha)
        finishLogin()
        return
      }

      const result = await login(email, senha)
      if ("requires2fa" in result && result.requires2fa) {
        setPreAuthToken(result.preAuthToken)
        return
      }
      finishLogin()
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
    <div
      id="main-content"
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.88 0.06 250 / 0.55), transparent), oklch(0.97 0.005 240)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.42 0.18 250 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(0.42 0.18 250 / 0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <Card className="relative w-full max-w-md p-6 sm:p-8 space-y-6 shadow-lg border-border/80">
        <div className="space-y-3 text-center">
          <AlarLogo variant="full" size="lg" className="justify-center" />
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {preAuthToken
              ? "Verificação em duas etapas"
              : isRegister
                ? "Criar conta no Alar"
                : "Entrar no Alar"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {preAuthToken
              ? "Digite o código do autenticador"
              : isRegister
                ? "Crie uma nova conta para o escritório"
                : "Acesse a gestão jurídica do escritório"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {preAuthToken ? (
            <>
              {useRecovery ? (
                <div className="space-y-2">
                  <Label htmlFor="recovery">Código de recuperação</Label>
                  <Input
                    id="recovery"
                    value={recovery}
                    onChange={(e) => setRecovery(e.target.value)}
                    required
                    autoComplete="one-time-code"
                    placeholder="ABCD-EFGH"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="otp">Código de 6 dígitos</Label>
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }, (_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || (useRecovery ? recovery.trim().length < 8 : otp.length !== 6)}
              >
                {loading ? "Aguarde..." : "Confirmar"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-primary hover:underline"
                onClick={() => setUseRecovery(!useRecovery)}
              >
                {useRecovery ? "Usar o app autenticador" : "Usar código de recuperação"}
              </button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:underline"
                onClick={() => {
                  setPreAuthToken(null)
                  setOtp("")
                  setRecovery("")
                  setUseRecovery(false)
                }}
              >
                Voltar ao login
              </button>
            </>
          ) : (
            <>
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
                  minLength={isRegister ? 10 : 1}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                {isRegister ? <PasswordHints senha={senha} /> : null}
                {!isRegister ? (
                  <p className="text-right text-xs">
                    <Link href="/esqueci-senha" className="text-muted-foreground underline">
                      Esqueci minha senha
                    </Link>
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Aguarde..." : isRegister ? "Cadastrar" : "Entrar"}
              </Button>
            </>
          )}
        </form>

        <AiDisclaimer compact />

        {!preAuthToken &&
          (ALLOW_PUBLIC_REGISTER ? (
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
          ))}
      </Card>
    </div>
  )
}
