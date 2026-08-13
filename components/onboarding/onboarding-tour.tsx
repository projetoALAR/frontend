"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  MessageCircle,
  Search,
  UserPlus,
  Sparkles,
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
import { canWriteClientesProcessos } from "@/lib/roles"
import { rotas } from "@/lib/app-routes"

const STEPS = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao Alar",
    description:
      "Centralize clientes, casos, prazos e documentos do escritório em um só lugar. Este tour leva menos de um minuto.",
  },
  {
    icon: UserPlus,
    title: "Cadastre clientes",
    description:
      "Comece pela aba Clientes. Cada cliente pode ter vários casos vinculados com CPF e contato.",
    action: { label: "Ir para Clientes", href: rotas.clientes },
  },
  {
    icon: Briefcase,
    title: "Abra casos e prazos",
    description:
      "Em Casos, crie processos, defina responsável, anexe documentos e acompanhe a timeline do andamento.",
    action: { label: "Ir para Casos", href: rotas.casos },
  },
  {
    icon: Search,
    title: "Busca e mensagens",
    description:
      "Use Ctrl+K para buscar por nome, CPF ou CNJ. Lembretes de prazo aparecem em Mensagens e no sino do topo.",
    action: { label: "Abrir Mensagens", href: rotas.mensagens },
  },
  {
    icon: MessageCircle,
    title: "Pronto para começar",
    description:
      "O assistente de IA em cada caso ajuda a resumir documentos — sempre com revisão humana. Boas-vindas!",
  },
] as const

export function OnboardingTour() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const canWrite = canWriteClientesProcessos(user?.role)

  useEffect(() => {
    if (loading || !user) return
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

  const finish = () => {
    if (user) markOnboardingDone(user.id)
    setOpen(false)
  }

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  const handleAction = () => {
    if ("action" in current && current.action) {
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

        <div className="flex justify-center gap-1.5 py-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {"action" in current && current.action && canWrite ? (
            <Button className="w-full" onClick={handleAction}>
              {current.action.label}
            </Button>
          ) : null}
          <div className="flex w-full gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep((s) => s - 1)}
              >
                Voltar
              </Button>
            )}
            <Button
              className="flex-1"
              variant={isLast ? "default" : "secondary"}
              onClick={() => {
                if (isLast) finish()
                else setStep((s) => s + 1)
              }}
            >
              {isLast ? "Começar" : "Próximo"}
            </Button>
          </div>
          {!isLast && (
            <Button variant="ghost" size="sm" className="w-full" onClick={finish}>
              Pular tour
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
