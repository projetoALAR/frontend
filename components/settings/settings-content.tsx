"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"
import { preferenciasApi, type NotificacoesPrefs } from "@/lib/preferencias-api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const defaultNotifications: NotificacoesPrefs = {
  email: true,
  push: true,
  reminders: true,
  teamUpdates: true,
}

export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notifications, setNotifications] = useState<NotificacoesPrefs>(defaultNotifications)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void preferenciasApi
      .obter()
      .then((prefs) => {
        setName(prefs.nome || "")
        setEmail(prefs.email || "")
        const n = prefs.notificacoes as NotificacoesPrefs
        setNotifications({
          email: !!n?.email,
          push: !!n?.push,
          reminders: !!n?.reminders,
          teamUpdates: !!n?.teamUpdates,
        })
        if (prefs.tema === "dark" || prefs.tema === "light") {
          setTheme(prefs.tema)
        }
      })
      .catch((error) => {
        toast({
          title: "Erro ao carregar preferências",
          description: error instanceof Error ? error.message : "Falha na API",
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [setTheme, toast])

  const persist = async (partial?: {
    nome?: string
    email?: string
    notificacoes?: NotificacoesPrefs
    tema?: string
  }) => {
    setSaving(true)
    try {
      await preferenciasApi.atualizar({
        nome: partial?.nome ?? name,
        email: partial?.email ?? email,
        notificacoes: partial?.notificacoes ?? notifications,
        tema: partial?.tema ?? theme,
      })
      toast({ title: "Preferências salvas" })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key: keyof NotificacoesPrefs) => {
    const next = { ...notifications, [key]: !notifications[key] }
    setNotifications(next)
    void persist({ notificacoes: next })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando configurações...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Informações do Perfil</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar-alar.png" alt="Alar" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">AL</AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() =>
                  toast({
                    title: "Em breve",
                    description: "Upload de foto ainda não está disponível",
                  })
                }
              >
                Alterar Foto
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Tamanho máximo 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary/90" disabled={saving} onClick={() => void persist()}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Notificações</h3>
        <div className="space-y-4">
          {[
            { label: "Notificações por e-mail", description: "Receba e-mails sobre a atividade da sua conta", key: "email" as const },
            { label: "Notificações push", description: "Receba notificações push no seu navegador", key: "push" as const },
            { label: "Lembretes de tarefas", description: "Seja lembrado sobre prazos de tarefas", key: "reminders" as const },
            { label: "Atualizações da equipe", description: "Notificações sobre atividades dos membros", key: "teamUpdates" as const },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={() => handleNotificationChange(item.key)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">Aparência</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Escuro</p>
              <p className="text-sm text-muted-foreground">Ativar o tema escuro</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => {
                const next = checked ? "dark" : "light"
                setTheme(next)
                void persist({ tema: next })
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
