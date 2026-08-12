"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"

export default function LogoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta",
      })
      router.replace("/login")
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 min-w-0 p-4 md:p-6 md:ml-64 flex items-center justify-center overflow-x-hidden">
        <Card className="p-6 sm:p-8 max-w-md w-full text-center space-y-6 animate-slide-in-up mx-2">
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ${isLoggingOut ? "animate-pulse" : ""}`}
            >
              <LogOut className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Sair</h1>
            <p className="text-muted-foreground">
              {isLoggingOut ? "Saindo da sua conta..." : "Tem certeza que deseja sair?"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
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
              onClick={() => void handleLogout()}
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
