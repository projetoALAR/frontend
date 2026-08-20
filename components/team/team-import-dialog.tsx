"use client"

import { useState } from "react"
import { ImportMapDialog } from "@/components/shared/import-map-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { equipeApi } from "@/lib/equipe-api"

type TeamImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

export function TeamImportDialog({
  open,
  onOpenChange,
  onImported,
}: TeamImportDialogProps) {
  const [senhaPadrao, setSenhaPadrao] = useState("AlarTrocar123")

  return (
    <ImportMapDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSenhaPadrao("AlarTrocar123")
        onOpenChange(next)
      }}
      onImported={onImported}
      titulo="Importar equipe"
      descricao="Envie a planilha de colaboradores do escritório. Para contas novas, use senha por linha ou a senha temporária padrão abaixo."
      modeloFilename="modelo-equipe-alar.xlsx"
      baixarModelo={() => equipeApi.baixarModeloImportacao()}
      preview={(arquivo) => equipeApi.previewImportacao(arquivo)}
      importar={(arquivo, mapeamento) =>
        equipeApi.importar(arquivo, mapeamento, senhaPadrao)
      }
      dicaObrigatoria="Obrigatório: Nome e E-mail. Papel padrão: ASSISTENTE. Peça troca de senha no 1º acesso."
      maxLinhas={100}
      extras={
        <div className="space-y-1.5 rounded-lg border border-border p-3">
          <Label htmlFor="senha-padrao-equipe" className="text-sm">
            Senha temporária padrão
          </Label>
          <Input
            id="senha-padrao-equipe"
            type="text"
            autoComplete="off"
            value={senhaPadrao}
            onChange={(e) => setSenhaPadrao(e.target.value)}
            className="h-9 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Usada quando a linha não tiver senha. Mín. 10 caracteres, com
            maiúscula, minúscula e número (ex.: AlarTrocar123).
          </p>
        </div>
      }
    />
  )
}
