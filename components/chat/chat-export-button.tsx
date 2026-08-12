"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { chatApi } from "@/lib/chat-api"
import { downloadTextFile } from "@/lib/download"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

type ChatExportButtonProps = {
  conversacaoId: string
  disabled?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "icon"
}

export function ChatExportButton({
  conversacaoId,
  disabled = false,
  variant = "outline",
  size = "sm",
}: ChatExportButtonProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)

  const handleExport = async (formato: "markdown" | "json") => {
    setExporting(true)
    try {
      const result = await chatApi.exportar(conversacaoId, formato)
      downloadTextFile(
        result.conteudo,
        result.nomeArquivo,
        formato === "json" ? "application/json" : "text/markdown",
      )
      toast({
        title: "Conversa exportada",
        description: result.nomeArquivo,
      })
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: error instanceof Error ? error.message : "Falha na API",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={disabled || exporting}
          aria-label="Exportar conversa"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void handleExport("markdown")}>
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleExport("json")}>
          JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
