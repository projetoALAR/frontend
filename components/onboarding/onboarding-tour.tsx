"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  Calendar,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { isOnboardingDone, markOnboardingDone } from "@/lib/onboarding"
import { canCreateUsers, canWriteClientesProcessos, type Role } from "@/lib/roles"
import { rotas } from "@/lib/app-routes"

type Step = {
  icon: typeof Sparkles
  title: string
  description: string
  action?: { label: string; href: string }
}

function stepsForRole(role: Role | undefined): Step[] {
  const comum: Step[] = [
    {
      icon: Sparkles,
      title: "Bem-vindo ao Alar",
      description:
        "Centralize clientes, casos, prazos e documentos do escritório em um só lugar. Este tour leva menos de um minuto.",
    },
    {
      icon: Briefcase,
      title: "Casos e prazos",
      description:
        "Em Casos você acompanha processos atribuídos a você, anexa documentos e usa a aba Prazos.",
      action: { label: "Ir para Casos", href: rotas.casos },
    },
    {
      icon: Calendar,
      title: "Agenda do escritório",
      description:
        "Compromissos e audiências ficam na Agenda — com link para o caso quando houver vínculo.",
      action: { label: "Abrir Agenda", href: rotas.agenda },
    },
    {
      icon: Search,
      title: "Busca rápida",
      description:
        "Use Ctrl+K para achar cliente, CPF/CNPJ ou número CNJ sem sair da tela.",
    },
    {
      icon: MessageCircle,
      title: "IA com revisão humana",
      description:
        "O chat do caso resume anexos e cita fontes. Sempre revise antes de usar em peça oficial.",
    },
  ]

  if (canWriteClientesProcessos(role)) {
    comum.splice(1, 0, {
      icon: UserPlus,
      title: "Cadastre clientes",
      description:
        "Comece pela aba Clientes. Cada cliente pode ter vários casos com CPF/CNPJ e contato.",
      action: { label: "Ir para Clientes", href: rotas.clientes },
    })
  } else {
    comum.splice(1, 0, {
      icon: Users,
      title: "Seu papel de assistente",
      description:
        "Você vê os casos em que é responsável ou co-responsável. Peça ao advogado a atribuição se faltar algum.",
      action: { label: "Ver meus casos", href: rotas.casos },
    })
  }

  if (canCreateUsers(role)) {
    comum.splice(comum.length - 1, 0, {
      icon: Shield,
      title: "Equipe e segurança",
      description:
        "Em Configurações você convida a equipe, acompanha SMTP e ativa 2FA. Em Relatórios exporta o recorte do escritório.",
      action: { label: "Abrir Configurações", href: rotas.configuracoes },
    })
  }

  return comum
}

export function OnboardingTour() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const steps = useMemo(() => stepsForRole(user?.role), [user?.role])

  useEffect(() => {
    if (loading || !user) return
    if (user.mustChangePassword) return
    if (isOnboardingDone(user.id)) return
    const timer = window.setTimeout(() => setOpen(true), 800)
    return () => window.clearTimeout(timer)
  }, [loading, user])

  useEffect(() => {
    const reopen = () => {
      setStep(0)
      setOpen(true)
    }
    window.addEventListener("openOnboardingTour", reopen)
    return () => window.removeEventListener("openOnboardingTour", reopen)
  }, [])

  useEffect(() => {
    setStep(0)
  }, [user?.role])

  const finish = () => {
    if (user) markOnboardingDone(user.id)
    setOpen(false)
  }

  const current = steps[step] ?? steps[0]
  const Icon = current.icon
  const isLast = step >= steps.length - 1

  const handleAction = () => {
    if (current.action) {
      finish()
      router.push(current.action.href)
      return
    }
    if (isLast) {
      finish()
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && finish()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">{current.title}</DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed">
            {current.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-1.5 py-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === step ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={finish}>
            Pular tour
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => setStep((s) => s - 1)}
              >
                Voltar
              </Button>
            ) : null}
            <Button
              type="button"
              className="flex-1 sm:flex-none"
              onClick={handleAction}
            >
              {current.action?.label
                ? current.action.label
                : isLast
                  ? "Concluir"
                  : "Próximo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
