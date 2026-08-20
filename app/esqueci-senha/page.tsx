"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlarLogo } from "@/components/brand/alar-logo"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/auth-api"

export default function EsqueciSenhaPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [devResetLink, setDevResetLink] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDevResetLink(null)
    try {
      const result = await authApi.forgotPassword(email)
      setEnviado(true)
      if (result.devResetLink) {
        setDevResetLink(result.devResetLink)
        toast({
          title: "Modo desenvolvimento",
          description: "SMTP off — use o link abaixo para redefinir a senha.",
        })
      } else {
        toast({
          title: "Se o e-mail existir, enviamos o link",
          description: "Verifique a caixa de entrada (e o spam).",
        })
      }
    } catch (error) {
      toast({
        title: "Não foi possível enviar",
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
        <h1 className="text-xl font-semibold text-center">Esqueci minha senha</h1>
        {enviado ? (
          <div className="space-y-3 text-sm text-muted-foreground text-center">
            <p>
              Se houver conta com esse e-mail, você receberá um link válido por 1
              hora.
            </p>
            {devResetLink ? (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-left space-y-2">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  Desenvolvimento (SMTP não configurado)
                </p>
                <a
                  href={devResetLink}
                  className="text-primary underline break-all text-xs"
                >
                  {devResetLink}
                </a>
              </div>
            ) : null}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}
        <p className="text-center text-sm">
          <Link href="/login" className="underline text-muted-foreground">
            Voltar ao login
          </Link>
        </p>
      </Card>
    </div>
  )
}
