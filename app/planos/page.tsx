"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { AlarLogo } from "@/components/brand/alar-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth/auth-provider"
import {
  PLANOS,
  billingEnforceAtivo,
  formatarPrecoBRL,
  lerAssinaturaLocal,
  sincronizarAssinaturaLocal,
  type PlanoId,
} from "@/lib/planos"
import { billingApi } from "@/lib/billing-api"
import { rotas } from "@/lib/app-routes"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type CheckoutMode = "trial" | "pago"

export default function PlanosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal")
  const [asaasOk, setAsaasOk] = useState(false)
  const [assinaturaTick, setAssinaturaTick] = useState(0)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutPlano, setCheckoutPlano] = useState<PlanoId | null>(null)
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("trial")
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [saving, setSaving] = useState(false)
  const enforce = billingEnforceAtivo()

  const refreshBilling = useCallback(async () => {
    if (!user) return
    try {
      const data = await billingApi.minha()
      setAsaasOk(data.asaasConfigurado)
      sincronizarAssinaturaLocal(user.id, data)
      setAssinaturaTick((n) => n + 1)
    } catch {
      // mantém cache local se a API falhar
    }
  }, [user])

  useEffect(() => {
    void refreshBilling()
  }, [refreshBilling])

  const assinatura = useMemo(() => {
    void assinaturaTick
    return user ? lerAssinaturaLocal(user.id) : null
  }, [user, assinaturaTick])

  const abrirCheckout = (planoId: PlanoId, mode: CheckoutMode) => {
    if (!user) {
      router.push(`${rotas.login}?plano=${planoId}`)
      return
    }
    if (planoId === "escritorio") {
      toast({
        title: "Plano Escritório",
        description:
          "Este plano é sob consulta. Fale com o comercial ou comece pelo Profissional.",
      })
      return
    }
    setCheckoutPlano(planoId)
    setCheckoutMode(mode)
    setCpfCnpj("")
    setCheckoutOpen(true)
  }

  const confirmarCheckout = async () => {
    if (!user || !checkoutPlano) return
    const digits = cpfCnpj.replace(/\D/g, "")
    if (digits.length !== 11 && digits.length !== 14) {
      toast({
        title: "CPF/CNPJ inválido",
        description: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const result = await billingApi.checkout({
        planoId: checkoutPlano,
        ciclo,
        cpfCnpj: digits,
        trial: checkoutMode === "trial",
      })
      sincronizarAssinaturaLocal(user.id, result)
      setAssinaturaTick((n) => n + 1)
      setCheckoutOpen(false)

      toast({
        title: checkoutMode === "trial" ? "Avaliação ativada" : "Assinatura criada",
        description: result.mensagem,
      })

      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank", "noopener,noreferrer")
      }

      if (result.temAcesso) {
        router.push(rotas.painel)
      }
    } catch (error) {
      toast({
        title: "Não foi possível continuar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      id="main-content"
      className="min-h-screen bg-background"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% -5%, oklch(0.90 0.04 250 / 0.45), transparent), oklch(0.975 0.006 245)",
      }}
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <AlarLogo href={user ? rotas.painel : rotas.login} size="md" />
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={rotas.painel}>Ir ao painel</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="border-border/80 bg-card/80" asChild>
              <Link href={rotas.login}>Entrar</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Planos Alar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Gestão jurídica com IA — no ritmo do seu escritório
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Casos, prazos, documentos e assistente com citação de anexos. Escolha o plano e
            comece a organizar a operação.
          </p>

          <div
            className="mx-auto mt-6 inline-flex rounded-full border border-border/80 bg-card p-1 shadow-sm"
            role="group"
            aria-label="Ciclo de cobrança"
          >
            <button
              type="button"
              onClick={() => setCiclo("mensal")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors",
                ciclo === "mensal"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setCiclo("anual")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors",
                ciclo === "anual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Anual
              <span className="ml-1.5 text-[11px] opacity-80">~2 meses off</span>
            </button>
          </div>

          {assinatura ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Acesso atual:{" "}
              <span className="font-medium text-foreground">{assinatura.planoId}</span>
              {" · "}
              {assinatura.status === "trial" ? "avaliação" : assinatura.status} até{" "}
              {new Date(assinatura.ate).toLocaleDateString("pt-BR")}
              {assinatura.invoiceUrl ? (
                <>
                  {" · "}
                  <a
                    href={assinatura.invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-foreground"
                  >
                    fatura Asaas
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          {asaasOk ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Pagamentos processados pelo Asaas (PIX, boleto ou cartão).
            </p>
          ) : (
            <p className="mt-3 text-xs text-amber-800/90 dark:text-amber-200/90">
              Asaas ainda sem API key no backend — a avaliação grátis funciona; a cobrança
              real exige configurar ASAAS_API_KEY.
            </p>
          )}

          {enforce ? (
            <p className="mt-2 text-xs text-amber-800/90 dark:text-amber-200/90">
              Paywall ativo: é preciso trial ou assinatura para entrar no app.
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {PLANOS.map((plano) => {
            const preco =
              ciclo === "mensal" ? plano.precoMensal : Math.round(plano.precoAnual / 12)
            return (
              <article
                key={plano.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                  plano.destaque
                    ? "border-primary/40 ring-1 ring-primary/20 lg:-mt-1 lg:mb-1 lg:shadow-md"
                    : "border-border/80",
                )}
              >
                {plano.destaque ? (
                  <span className="mb-3 w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    Mais escolhido
                  </span>
                ) : (
                  <span className="mb-3 h-5" aria-hidden />
                )}
                <h2 className="text-lg font-semibold tracking-tight">{plano.nome}</h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {plano.descricao}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  {plano.id === "escritorio" ? (
                    <span className="mr-1 text-sm text-muted-foreground">A partir de</span>
                  ) : null}
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">
                    {formatarPrecoBRL(preco)}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                {ciclo === "anual" && plano.id !== "escritorio" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatarPrecoBRL(plano.precoAnual)} cobrados no ano
                  </p>
                ) : ciclo === "anual" && plano.id === "escritorio" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Condições finais sob consulta
                  </p>
                ) : plano.id === "escritorio" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Preço sob consulta conforme equipe e volume
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-transparent select-none">.</p>
                )}

                <ul className="mt-5 space-y-2 border-t border-border/70 pt-5">
                  {plano.limites.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-3 space-y-2">
                  {plano.recursos.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-2">
                  <Button
                    className="w-full"
                    variant={plano.destaque ? "default" : "outline"}
                    onClick={() => abrirCheckout(plano.id, "trial")}
                  >
                    {plano.id === "escritorio" ? plano.cta : "Ativar 14 dias grátis"}
                  </Button>
                  {plano.id !== "escritorio" ? (
                    <Button
                      className="w-full"
                      variant="ghost"
                      onClick={() => abrirCheckout(plano.id, "pago")}
                    >
                      Assinar agora (Asaas)
                    </Button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
          *Casos e clientes ilimitados sujeitos a uso razoável. Tokens de IA e armazenamento
          podem ser ajustados por plano. Impostos e condições comerciais finais na contratação.
        </p>
      </main>

      <Dialog open={checkoutOpen} onOpenChange={(open) => !saving && setCheckoutOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {checkoutMode === "trial" ? "Avaliação de 14 dias" : "Assinar com Asaas"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Plano{" "}
              <span className="font-medium text-foreground">{checkoutPlano}</span>
              {" · "}
              ciclo {ciclo}. O Asaas pede CPF ou CNPJ do pagador.
            </p>
            <div>
              <Label htmlFor="cpf-cnpj">CPF ou CNPJ</Label>
              <Input
                id="cpf-cnpj"
                className="mt-1"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckoutOpen(false)}
              disabled={saving}
              className="bg-transparent"
            >
              Cancelar
            </Button>
            <Button onClick={() => void confirmarCheckout()} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : checkoutMode === "trial" ? (
                "Ativar avaliação"
              ) : (
                "Ir para pagamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
