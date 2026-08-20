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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setEnviado(true)
      toast({
        title: "Se o e-mail existir, enviamos o link",
        description: "Verifique a caixa de entrada (e o spam).",
      })
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
          <p className="text-sm text-muted-foreground text-center">
            Se houver conta com esse e-mail, você receberá um link válido por 1 hora.
          </p>
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
