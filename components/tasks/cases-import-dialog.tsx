"use client"

import { ImportMapDialog } from "@/components/shared/import-map-dialog"
import { processosApi } from "@/lib/processos-api"

type CasesImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

export function CasesImportDialog({
  open,
  onOpenChange,
  onImported,
}: CasesImportDialogProps) {
  return (
    <ImportMapDialog
      open={open}
      onOpenChange={onOpenChange}
      onImported={onImported}
      titulo="Importar casos"
      descricao="Importe os clientes antes. Envie a planilha de processos do escritório — mapeamos as colunas automaticamente quando possível."
      modeloFilename="modelo-casos-alar.xlsx"
      baixarModelo={() => processosApi.baixarModeloImportacao()}
      preview={(arquivo) => processosApi.previewImportacao(arquivo)}
      importar={(arquivo, mapeamento) =>
        processosApi.importarCsv(arquivo, mapeamento)
      }
      dicaObrigatoria="Obrigatório: número do processo + CPF, CNPJ ou documento do cliente já cadastrado."
    />
  )
}
