"use client"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, CheckCircle2 } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function LogoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingOutComplete, setIsLoggingOutComplete] = useState(false)

  const handleLogout = () => {
    setIsLoggingOut(true)
    toast({
      title: "Saindo...",
      description: "Você está sendo desconectado",
    })

    // Simular processo de logout com delay
    setTimeout(() => {
      localStorage.removeItem("userSession")
      sessionStorage.clear()
      setIsLoggingOut(false)
      setIsLoggingOutComplete(true)

      toast({
        title: "Logout realizado!",
        description: "Você saiu da sua conta com sucesso",
      })

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }, 1500)
  }

  const handleCancel = () => {
    router.back()
    toast({
      title: "Logout cancelado",
      description: "Você continuará conectado",
    })
  }

  if (isLoggingOutComplete) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-4 lg:p-6 lg:ml-64 flex items-center justify-center">
          <Card className="p-8 max-w-md w-full text-center space-y-6 animate-slide-in-up">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Logout Realizado!</h1>
              <p className="text-muted-foreground">Você saiu com sucesso da sua conta</p>
            </div>
            <p className="text-xs text-muted-foreground">Você será redirecionado em instantes...</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-6 lg:ml-64 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center space-y-6 animate-slide-in-up">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ${isLoggingOut ? "animate-pulse" : ""}`}>
              <LogOut className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Sair</h1>
            <p className="text-muted-foreground">
              {isLoggingOut ? "Saindo da sua conta..." : "Tem certeza que deseja sair?"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleCancel}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Desconectando..." : "Sair"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
