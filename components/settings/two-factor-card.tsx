"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/auth-api"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function TwoFactorCard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [setup, setSetup] = useState<{
    secret: string
    qrDataUrl: string
  } | null>(null)
  const [code, setCode] = useState("")
  const [saving, setSaving] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [senha, setSenha] = useState("")
  const [disableCode, setDisableCode] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const status = await authApi.twoFactorStatus()
      setEnabled(status.enabled)
    } catch (error) {
      toast({
        title: "Erro ao carregar 2FA",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startSetup = async () => {
    setSaving(true)
    try {
      const result = await authApi.setupTwoFactor()
      setSetup({ secret: result.secret, qrDataUrl: result.qrDataUrl })
      setCode("")
      setRecoveryCodes(null)
    } catch (error) {
      toast({
        title: "Não foi possível gerar o QR",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const confirmEnable = async () => {
    setSaving(true)
    try {
      const result = await authApi.enableTwoFactor(code)
      setEnabled(true)
      setSetup(null)
      setCode("")
      setRecoveryCodes(result.recoveryCodes)
      toast({ title: "2FA ativado", description: "Guarde os códigos de recuperação." })
    } catch (error) {
      toast({
        title: "Código inválido",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const disable = async () => {
    setSaving(true)
    try {
      await authApi.disableTwoFactor(senha, disableCode)
      setEnabled(false)
      setSenha("")
      setDisableCode("")
      setRecoveryCodes(null)
      toast({ title: "2FA desativado" })
    } catch (error) {
      toast({
        title: "Não foi possível desativar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const copyRecovery = async () => {
    if (!recoveryCodes) return
    await navigator.clipboard.writeText(recoveryCodes.join("\n"))
    toast({ title: "Códigos copiados" })
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Carregando 2FA...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Autenticação em dois fatores</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Obrigatório no próximo login depois de ativar. Use Google Authenticator, Authy ou similar.
        </p>
      </div>

      {recoveryCodes ? (
        <div className="rounded-md border border-border p-4 space-y-3">
          <p className="text-sm font-medium">
            Guarde estes códigos agora — eles não aparecem de novo.
          </p>
          <ul className="font-mono text-sm grid grid-cols-2 gap-1">
            {recoveryCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => void copyRecovery()}>
            Copiar códigos
          </Button>
        </div>
      ) : null}

      {enabled && !setup ? (
        <div className="space-y-4">
          <p className="text-sm text-emerald-600">2FA está ativo nesta conta.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-senha">Senha atual</Label>
              <Input
                id="2fa-senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="2fa-off">Código 2FA ou recuperação</Label>
              <Input
                id="2fa-off"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                autoComplete="one-time-code"
              />
            </div>
          </div>
          <Button
            variant="outline"
            disabled={saving || !senha || disableCode.length < 6}
            onClick={() => void disable()}
          >
            {saving ? "Desativando..." : "Desativar 2FA"}
          </Button>
        </div>
      ) : setup ? (
        <div className="space-y-4">
          <img
            src={setup.qrDataUrl}
            alt="QR Code para autenticador"
            className="w-[220px] h-[220px] rounded-md border border-border bg-white"
          />
          <p className="text-xs text-muted-foreground break-all">
            Chave manual: <span className="font-mono">{setup.secret}</span>
          </p>
          <div className="space-y-2">
            <Label>Código do app</Label>
            <InputOTP maxLength={6} value={code} onChange={setCode} containerClassName="justify-start">
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex gap-2">
            <Button disabled={saving || code.length !== 6} onClick={() => void confirmEnable()}>
              {saving ? "Confirmando..." : "Confirmar e ativar"}
            </Button>
            <Button
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setSetup(null)
                setCode("")
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button disabled={saving} onClick={() => void startSetup()}>
          {saving ? "Gerando..." : "Ativar 2FA"}
        </Button>
      )}
    </Card>
  )
}
