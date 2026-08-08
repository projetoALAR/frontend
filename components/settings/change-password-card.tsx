"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/auth-api"

export function ChangePasswordCard() {
  const { toast } = useToast()
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (novaSenha.length < 8) {
      toast({
        title: "Senha fraca",
        description: "A nova senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      })
      return
    }
    if (novaSenha !== confirmar) {
      toast({
        title: "Confirmação inválida",
        description: "A confirmação não coincide com a nova senha",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await authApi.changePassword(senhaAtual, novaSenha)
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmar("")
      toast({ title: "Senha atualizada", description: "Use a nova senha no próximo login" })
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-2">Alterar senha</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Informe a senha atual e defina uma nova com pelo menos 8 caracteres.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senha-atual">Senha atual</Label>
          <Input
            id="senha-atual"
            type="password"
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nova-senha">Nova senha</Label>
          <Input
            id="nova-senha"
            type="password"
            autoComplete="new-password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
          <Input
            id="confirmar-senha"
            type="password"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
        </div>
      </div>
      <Button
        className="mt-6 bg-primary hover:bg-primary/90"
        disabled={saving || !senhaAtual || !novaSenha || !confirmar}
        onClick={() => void handleSubmit()}
      >
        {saving ? "Alterando..." : "Alterar senha"}
      </Button>
    </Card>
  )
}
