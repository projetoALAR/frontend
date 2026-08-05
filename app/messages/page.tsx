"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useState } from "react"
import { inboxApi, type InboxItemApi } from "@/lib/inbox-api"
import { formatDatePt } from "@/lib/format"
import { Loader2, MailOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function MessagesPage() {
  const [items, setItems] = useState<InboxItemApi[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await inboxApi.listar())
    } catch (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const marcarTodas = async () => {
    await inboxApi.marcarTodas()
    setItems((prev) => prev.map((i) => ({ ...i, lida: true })))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-6 lg:ml-64 overflow-x-hidden">
        <Header
          title="Mensagens"
          description="Caixa de entrada do sistema: alertas, contatos e avisos."
          actions={
            <Button variant="outline" onClick={() => void marcarTodas()}>
              <MailOpen className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          }
        />

        <div className="mt-6 space-y-3 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando...
            </div>
          ) : items.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Nenhuma mensagem ainda.</Card>
          ) : (
            items.map((item) => (
              <Card
                key={item.id}
                className={`p-4 cursor-pointer transition-colors ${!item.lida ? "border-primary/40 bg-secondary/30" : ""}`}
                onClick={() => {
                  void inboxApi.marcarLida(item.id)
                  setItems((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, lida: true } : i)),
                  )
                  if (item.link) router.push(item.link)
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.titulo}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.corpo}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDatePt(item.criadoEm)}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
